import express from 'express';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: false });

export const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- Gemini AI client ---
function getMailAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ---------------------------------------------------------------------------
// MailMind AI endpoints
// ---------------------------------------------------------------------------

app.post('/api/ai/generate-draft', async (req, res) => {
  try {
    const { prompt, tone = 'Professional', subject = '', context = '' } = req.body;
    const ai = getMailAiClient();
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (ai) {
      const systemInstruction = `You are altitude Mail AI, an elite executive email assistant.
Generate a high-quality email draft based on the user's prompt.
Tone requested: ${tone}
Subject Context: ${subject || 'General'}
Context: ${context || 'None'}

Format guidelines:
- Include a suitable Salutation (e.g., Dear [Name], or Hi [Name],)
- Clear, well-structured paragraphs
- Professional sign-off (e.g., Best regards, [Your Name])
- Do not include meta text, backticks, or extra markdown greetings. Just the email content.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 },
      });
      return res.json({ draft: response.text?.trim() || '' });
    }

    const fallbackDraft = `Dear [Name],\n\nI am writing to request a brief extension for the ${subject || 'project'} delivery. While I have made significant progress, additional time would ensure the data analysis meets our rigorous standards. Could we adjust the deadline to [New Date]?\n\nThank you for your understanding.\n\nBest regards,\n[Your Name]`;
    return res.json({ draft: fallbackDraft });
  } catch (error: any) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate draft' });
  }
});

app.post('/api/ai/refine-draft', async (req, res) => {
  try {
    const { draft, action, targetTone } = req.body;
    const ai = getMailAiClient();
    if (!draft) return res.status(400).json({ error: 'Draft is required' });

    if (ai) {
      let promptInstruction = '';
      if (action === 'shorten') {
        promptInstruction = 'Make this email draft significantly more concise and punchy while retaining all critical action items.';
      } else if (action === 'grammar') {
        promptInstruction = 'Fix all grammar, phrasing, punctuation, and typographical issues in this email, ensuring pristine executive polish.';
      } else if (action === 'tone' && targetTone) {
        promptInstruction = `Rewrite this email with a strictly ${targetTone} tone.`;
      } else {
        promptInstruction = 'Improve clarity and flow of this email draft.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${promptInstruction}\n\nOriginal Draft:\n${draft}`,
      });
      return res.json({ draft: response.text?.trim() || draft });
    }

    if (action === 'shorten') {
      return res.json({ draft: draft.split('\n\n').slice(0, 3).join('\n\n') });
    }
    return res.json({ draft });
  } catch (error: any) {
    console.error('Refine draft error:', error);
    res.status(500).json({ error: error.message || 'Failed to refine draft' });
  }
});

app.post('/api/ai/summarize-email', async (req, res) => {
  try {
    const { emailContent, subject } = req.body;
    const ai = getMailAiClient();
    if (!emailContent) return res.status(400).json({ error: 'Email content is required' });

    if (ai) {
      const prompt = `Analyze this email and return a JSON object summarizing key information:
Subject: ${subject}
Content: ${emailContent}

Return JSON with this exact shape:
{
  "bullets": ["3-4 concise bullet point takeaways"],
  "actionRequired": "Brief string with the primary single action required or 'None'",
  "deadline": "Extracted deadline string (e.g. 'Friday, 11:59 PM') or 'None specified'
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    return res.json({
      bullets: ['Assignment submission deadline is Friday', 'Project report needs to be reviewed', 'Meeting scheduled for Monday'],
      actionRequired: 'Review project report',
      deadline: 'Friday, 11:59 PM',
    });
  } catch (error: any) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: error.message || 'Failed to summarize email' });
  }
});

app.post('/api/ai/ask-email', async (req, res) => {
  try {
    const { emailContent, question } = req.body;
    const ai = getMailAiClient();
    if (!question || !emailContent) return res.status(400).json({ error: 'Question and content are required' });

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are answering questions about this specific email.\n\nEmail Content:\n${emailContent}\n\nUser Question:\n${question}\n\nAnswer concisely in 1-3 sentences.`,
      });
      return res.json({ answer: response.text?.trim() || '' });
    }

    return res.json({
      answer: `Based on the email, the primary focus is delivering feedback by Friday at 11:59 PM, with Section 4 being the highest priority.`,
    });
  } catch (error: any) {
    console.error('Ask AI error:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// ---------------------------------------------------------------------------
// Mail API Store (Supabase)
// ---------------------------------------------------------------------------
interface Mailbox {
  emails: any[];
  meetings: any[];
  tasks: any[];
  followUps: any[];
  decisions: any[];
  newsletters: any[];
  settings: any | null;
}

const DEFAULT_MAIL_SETTINGS = {
  enableAiSummaries: true,
  enableAiPriority: true,
  enableSmartSearch: false,
  enableInboxCleaner: true,
  enableMeetingDetection: true,
};

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

// --- Supabase mail helpers ---

async function getMailbox(userId: string): Promise<Mailbox> {
  const client = getSupabaseServer();
  if (!client) return { emails: [], meetings: [], tasks: [], followUps: [], decisions: [], newsletters: [], settings: null };

  const emailsRes = await client.from('mail_emails').select('*').order('created_at', { ascending: false });
  const meetingsRes = await client.from('mail_meetings').select('*').order('created_at', { ascending: false });
  const tasksRes = await client.from('mail_tasks').select('*').order('created_at', { ascending: false });
  const followupsRes = await client.from('mail_followups').select('*').order('created_at', { ascending: false });
  const decisionsRes = await client.from('mail_decisions').select('*').order('created_at', { ascending: false });
  const newslettersRes = await client.from('mail_newsletters').select('*').order('created_at', { ascending: false });
  const settingsRes = await client.from('mail_settings').select('*').single();

  return {
    emails: (emailsRes.data || []).map(mapEmailRow),
    meetings: (meetingsRes.data || []).map(mapMeetingRow),
    tasks: (tasksRes.data || []).map(mapTaskRow),
    followUps: (followupsRes.data || []).map(mapFollowupRow),
    decisions: (decisionsRes.data || []).map(mapDecisionRow),
    newsletters: (newslettersRes.data || []).map(mapNewsletterRow),
    settings: settingsRes.data ? {
      enableAiSummaries: (settingsRes.data as any).enable_ai_summaries,
      enableAiPriority: (settingsRes.data as any).enable_ai_priority,
      enableSmartSearch: (settingsRes.data as any).enable_smart_search,
      enableInboxCleaner: (settingsRes.data as any).enable_inbox_cleaner,
      enableMeetingDetection: (settingsRes.data as any).enable_meeting_detection,
    } : null,
  };
}

// Mappers: DB rows -> app objects
const mapEmailRow = (r: any) => ({
  id: r.id, sender: r.sender, recipient: r.recipient, subject: r.subject,
  snippet: r.snippet, body: r.body, timestamp: r.timestamp, formattedDate: r.formatted_date,
  isRead: r.is_read, isStarred: r.is_starred, category: r.category,
  priorityBadge: r.priority_badge, hasBlueIndicator: r.has_blue_indicator,
  aiSummary: r.ai_summary, attachments: r.attachments, folder: r.folder,
});
const mapMeetingRow = (r: any) => ({ id: r.id, title: r.title, timeframe: r.timeframe, dateStr: r.date_str, sender: r.sender, status: r.status });
const mapTaskRow = (r: any) => ({ id: r.id, title: r.title, from: r.from, isHighPriority: r.is_high_priority, status: r.status });
const mapFollowupRow = (r: any) => ({ id: r.id, title: r.title, waitingFor: r.waiting_for, daysWaiting: r.days_waiting, status: r.status });
const mapDecisionRow = (r: any) => ({ id: r.id, title: r.title, description: r.description, status: r.status });
const mapNewsletterRow = (r: any) => ({ id: r.id, name: r.name, email: r.email, initials: r.initials, bgColor: r.bg_color, activity: r.activity, selected: r.selected, unsubscribed: r.unsubscribed });

// Mappers: app objects -> DB rows
const mapEmailToRow = (e: any) => ({
  id: e.id, sender: e.sender || {}, recipient: e.recipient, subject: e.subject,
  snippet: e.snippet, body: e.body, timestamp: e.timestamp, formatted_date: e.formattedDate,
  is_read: e.isRead ?? false, is_starred: e.isStarred ?? false, category: e.category || 'primary',
  priority_badge: e.priorityBadge || null, has_blue_indicator: e.hasBlueIndicator ?? false,
  ai_summary: e.aiSummary || null, attachments: e.attachments || null, folder: e.folder || 'inbox',
});
const mapMeetingToRow = (m: any) => ({ id: m.id, title: m.title, timeframe: m.timeframe, date_str: m.dateStr, sender: m.sender, status: m.status || 'pending' });
const mapTaskToRow = (t: any) => ({ id: t.id, title: t.title, from: t.from, is_high_priority: t.isHighPriority ?? false, status: t.status || 'pending' });
const mapFollowupToRow = (f: any) => ({ id: f.id, title: f.title, waiting_for: f.waitingFor, days_waiting: f.daysWaiting ?? 0, status: f.status || 'pending' });
const mapDecisionToRow = (d: any) => ({ id: d.id, title: d.title, description: d.description, status: d.status || 'pending' });
const mapNewsletterToRow = (n: any) => ({ id: n.id, name: n.name, email: n.email, initials: n.initials, bg_color: n.bgColor, activity: n.activity, selected: n.selected ?? false, unsubscribed: n.unsubscribed ?? false });

// --- Identity ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let _supabaseServer: ReturnType<typeof createClient> | null = null;
function getSupabaseServer(): any {
  if (!_supabaseServer && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseServer;
}

interface AuthUser { id: string; email: string; }

async function getAuthUser(req: express.Request): Promise<AuthUser | null> {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const supabaseServer = getSupabaseServer();
  if (supabaseServer) {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (!error && data.user) return { id: data.user.id, email: data.user.email || '' };
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString('utf-8'));
    if (payload && payload.email) return { id: payload.sub || payload.email, email: String(payload.email) };
  } catch {}
  return null;
}

async function requireUser(req: express.Request, res: express.Response): Promise<AuthUser | null> {
  const user = await getAuthUser(req);
  if (!user || !user.email) {
    res.status(401).json({ error: 'Unauthorized — sign in to access your mailbox.' });
    return null;
  }
  return user;
}

// --- Welcome message ---
function buildWelcomeEmail(userEmail: string) {
  const now = new Date();
  return {
    id: `welcome-${normalizeEmail(userEmail)}`,
    sender: { name: 'altitude Workspace', email: 'welcome@altitude.app', initials: 'AL', isStarredSender: true },
    recipient: userEmail,
    subject: 'Welcome to altitude — your workspace mailbox is ready 🎉',
    snippet: 'Your altitude account is live. This mailbox connects you with every app in the workspace: mail, meetings, AI memory and more.',
    body: `Hi there,\n\nWelcome to altitude! 🎉\n\nYour account is now live and this is your personal workspace mailbox. Everything your team builds on altitude — mail, video meetings, AI memory, recordings — connects here, so you'll always have one home for it all.\n\nA few things to try:\n\n  • Compose your first message from the Mail tab\n  • Let the altitude Assistant draft, summarize and answer questions about your emails\n  • Use the Action Center to track meetings, tasks and follow-ups pulled from your mail\n\nThis message lives on the altitude server, delivered the moment your account was created.\n\n— The altitude Workspace team`,
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isRead: false, isStarred: false, category: 'primary', hasBlueIndicator: true, folder: 'inbox',
  };
}

async function ensureWelcomeMail(userId: string, email: string): Promise<boolean> {
  const client = getSupabaseServer();
  if (!client) return false;
  const welcomeId = `welcome-${normalizeEmail(email)}`;
  const { data } = await client.from('mail_emails').select('id').eq('id', welcomeId).single();
  if (data) return false;
  const welcome = buildWelcomeEmail(email);
  await client.from('mail_emails').insert(mapEmailToRow(welcome));
  return true;
}

async function seedWelcomeMail(userId: string, email: string): Promise<boolean> {
  return ensureWelcomeMail(userId, email);
}

async function removeMailbox(userId: string): Promise<void> {
  const client = getSupabaseServer();
  if (!client) return;
  await Promise.all([
    client.from('mail_emails').delete().eq('user_id', userId),
    client.from('mail_meetings').delete().eq('user_id', userId),
    client.from('mail_tasks').delete().eq('user_id', userId),
    client.from('mail_followups').delete().eq('user_id', userId),
    client.from('mail_decisions').delete().eq('user_id', userId),
    client.from('mail_newsletters').delete().eq('user_id', userId),
    client.from('mail_settings').delete().eq('user_id', userId),
  ]);
}

// Mail REST endpoints
app.get('/api/mail', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  await ensureWelcomeMail(user.id, user.email);
  const box = await getMailbox(user.id);
  res.json({ emails: box.emails, meetings: box.meetings, tasks: box.tasks, followUps: box.followUps, decisions: box.decisions, newsletters: box.newsletters, settings: box.settings || DEFAULT_MAIL_SETTINGS });
});

app.post('/api/mail/emails', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const incoming: any[] = Array.isArray(req.body?.emails) ? req.body.emails : [];
  const client = getSupabaseServer();
  if (!client) return res.status(500).json({ error: 'Database not configured' });
  const rows = incoming.map(mapEmailToRow) as any[];
  const { error } = await client.from('mail_emails').upsert(rows, { onConflict: 'id' });
  if (error) console.error('[mail] upsert emails error:', error.message);
  res.json({ ok: true, count: incoming.length });
});

app.delete('/api/mail/emails', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const client = getSupabaseServer();
  if (!client) return res.status(500).json({ error: 'Database not configured' });
  if (ids.length > 0) {
    await client.from('mail_emails').delete().in('id', ids);
  }
  res.json({ ok: true, deleted: ids.length });
});

const MAIL_COLLECTIONS: Array<{ route: string; bodyKey: string; table: string; mapper: (item: any) => any }> = [
  { route: 'meetings', bodyKey: 'meetings', table: 'mail_meetings', mapper: mapMeetingToRow },
  { route: 'tasks', bodyKey: 'tasks', table: 'mail_tasks', mapper: mapTaskToRow },
  { route: 'followups', bodyKey: 'followUps', table: 'mail_followups', mapper: mapFollowupToRow },
  { route: 'decisions', bodyKey: 'decisions', table: 'mail_decisions', mapper: mapDecisionToRow },
  { route: 'newsletters', bodyKey: 'newsletters', table: 'mail_newsletters', mapper: mapNewsletterToRow },
];

for (const { route, bodyKey, table, mapper } of MAIL_COLLECTIONS) {
  app.post(`/api/mail/${route}`, async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const incoming: any[] = Array.isArray(req.body?.[bodyKey]) ? req.body[bodyKey] : [];
    const client = getSupabaseServer();
    if (!client) return res.status(500).json({ error: 'Database not configured' });
    const rows = incoming.map(mapper) as any[];
    const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
    if (error) console.error(`[mail] upsert ${route} error:`, error.message);
    res.json({ ok: true, count: incoming.length });
  });
}

app.get('/api/mail/settings', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const box = await getMailbox(user.id);
  res.json(box.settings || DEFAULT_MAIL_SETTINGS);
});

app.post('/api/mail/settings', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const client = getSupabaseServer();
  if (!client) return res.status(500).json({ error: 'Database not configured' });
  const settings = { ...DEFAULT_MAIL_SETTINGS, ...(req.body?.settings || {}) };
  await client.from('mail_settings').upsert({
    user_id: user.id,
    enable_ai_summaries: settings.enableAiSummaries ?? true,
    enable_ai_priority: settings.enableAiPriority ?? true,
    enable_smart_search: settings.enableSmartSearch ?? false,
    enable_inbox_cleaner: settings.enableInboxCleaner ?? true,
    enable_meeting_detection: settings.enableMeetingDetection ?? true,
  } as any, { onConflict: 'user_id' });
  res.json(settings);
});

// --- Auth webhook ---
const AUTH_WEBHOOK_SECRET = process.env.AUTH_WEBHOOK_SECRET || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a || ''); const bb = Buffer.from(b || '');
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

let _supabaseService: ReturnType<typeof createClient> | null = null;
function getSupabaseService() {
  if (!_supabaseService && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    _supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return _supabaseService;
}

async function upsertMailAccount(userId: string | null, email: string) {
  const service = getSupabaseService();
  if (!service || !userId) return;
  const { error } = await (service as any).from('mail_accounts').upsert({ id: userId, email, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) console.warn('[webhook] mail_accounts upsert failed:', error.message);
}

app.post('/api/auth/webhook', async (req, res) => {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!AUTH_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook secret not configured on server.' });
  if (!safeEqual(token, AUTH_WEBHOOK_SECRET)) return res.status(401).json({ error: 'Invalid webhook secret.' });

  const body = req.body || {};
  const event = String(body.event || '');
  const type = String(body.type || '').toUpperCase();
  const record = body.user || body.record || {};
  const email = String(record.email || '').trim().toLowerCase();
  const userId = String(record.id || record.sub || '');

  const isCreate = event === 'user.created' || (type === 'INSERT' && body.table === 'users');
  const isDelete = event === 'user.deleted' || (type === 'DELETE' && body.table === 'users');

  if (!email) return res.json({ ok: true, skipped: 'no email in payload' });
  if (isCreate) {
    const welcome = await seedWelcomeMail(userId || '', email);
    await upsertMailAccount(userId || null, email);
    console.log(`[webhook] account created ${email} — welcome mail ${welcome ? 'delivered' : 'already present'}`);
    return res.json({ ok: true, account: email, welcomeDelivered: welcome });
  }
  if (isDelete) {
    await removeMailbox(userId || '');
    console.log(`[webhook] account deleted — mailbox removed for ${email}`);
    return res.json({ ok: true, removed: email });
  }
  return res.json({ ok: true, ignored: event || type });
});

// --- Account confirmation ---
const CONFIRM_FILE = path.join(process.cwd(), 'auth-confirm-store.json');
const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

interface ConfirmEntry { token: string; email: string; userId: string; createdAt: string; expiresAt: string; }

function loadConfirmStore(): Record<string, ConfirmEntry> {
  try { const raw = JSON.parse(fs.readFileSync(CONFIRM_FILE, 'utf-8')); if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, ConfirmEntry>; } catch {}
  return {};
}

function saveConfirmStore(store: Record<string, ConfirmEntry>) {
  fs.writeFileSync(CONFIRM_FILE, JSON.stringify(store, null, 2));
}

function buildConfirmMessage(userEmail: string, confirmUrl: string) {
  const now = new Date();
  return {
    id: `confirm-${normalizeEmail(userEmail)}`,
    sender: { name: 'altitude Security', email: 'security@altitude.app', initials: 'AL', isStarredSender: true },
    recipient: userEmail,
    subject: 'Confirm your altitude account ✅',
    snippet: 'Click Confirm my account to activate your altitude workspace.',
    body: `Hi there,\n\nThanks for registering on altitude. Your account is almost ready — one last step:\nyour email needs to be confirmed before you can use the workspace.\n\nOpen the button below (or copy this link into your browser):\n${confirmUrl}\n\nThis link expires in 24 hours.\n\n— altitude Security`,
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isRead: false, isStarred: true, category: 'primary', hasBlueIndicator: true, folder: 'inbox', confirmUrl,
  };
}

async function ensurePendingConfirmation(userId: string, email: string, origin: string): Promise<{ confirmUrl: string; created: boolean }> {
  const key = normalizeEmail(email);
  const store = loadConfirmStore();
  const existing = store[key];
  if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
    return { confirmUrl: `${origin}/?confirm=${existing.token}`, created: false };
  }
  const token = randomBytes(24).toString('hex');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + CONFIRM_TTL_MS).toISOString();
  store[key] = { token, email, userId, createdAt, expiresAt };
  saveConfirmStore(store);
  const confirmUrl = `${origin}/?confirm=${token}`;
  // Insert confirm email into Supabase
  const client = getSupabaseServer();
  if (client) {
    const confirmMsg = buildConfirmMessage(email, confirmUrl);
    const msgId = `confirm-${key}`;
    // Delete old confirm message if exists
    await client.from('mail_emails').delete().eq('id', msgId);
    await client.from('mail_emails').insert(mapEmailToRow(confirmMsg) as any);
  }
  return { confirmUrl, created: true };
}

app.post('/api/auth/deliver-confirmation', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const origin = String(req.body?.origin || '').replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s]+$/.test(origin)) return res.status(400).json({ error: 'origin is required' });
  const { confirmUrl, created } = await ensurePendingConfirmation(user.id, user.email, origin);
  res.json({ ok: true, confirmUrl, created });
});

app.post('/api/auth/confirm', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const token = String(req.body?.token || '');
  const key = normalizeEmail(user.email);
  const store = loadConfirmStore();
  const entry = store[key];
  if (!entry || entry.token !== token) return res.status(400).json({ error: 'Invalid or expired confirmation link.' });
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    delete store[key]; saveConfirmStore(store);
    return res.status(400).json({ error: 'This confirmation link has expired. Register again.' });
  }
  delete store[key]; saveConfirmStore(store);
  // Mark confirm email as read in Supabase
  const client = getSupabaseServer();
  if (client) {
    const msgId = `confirm-${key}`;
    await client.from('mail_emails').update({ is_read: true, is_starred: false } as any).eq('id', msgId);
  }
  const service = getSupabaseService();
  if (service) {
    try { await service.auth.admin.updateUserById(user.id, { email_confirm: true }); } catch (e: any) { console.warn('[confirm] updateUserById failed:', e?.message || e); }
  }
  console.log(`[confirm] account confirmed ${key}`);
  res.json({ ok: true, confirmed: true });
});

app.get('/api/auth/status', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const key = normalizeEmail(user.email);
  const entry = loadConfirmStore()[key];
  const pending = !!(entry && new Date(entry.expiresAt).getTime() > Date.now());
  res.json({ confirmed: !pending, pending });
});

// --- Sign-in notification ---
const SIGNIN_NOTIFY_MIN_MS = 10 * 60 * 1000;

app.post('/api/auth/notify-signin', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const client = getSupabaseServer();
  if (!client) return res.status(500).json({ error: 'Database not configured' });
  // Check for recent signin notification (throttle)
  const { data: recent } = await client
    .from('mail_emails')
    .select('timestamp')
    .like('id', 'signin-%')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  if (recent && Date.now() - new Date(recent.timestamp).getTime() < SIGNIN_NOTIFY_MIN_MS) {
    return res.json({ ok: true, skipped: 'throttled' });
  }
  const now = new Date();
  const key = normalizeEmail(user.email);
  const msg = {
    id: `signin-${key}-${now.getTime()}`,
    sender: { name: 'altitude Security', email: 'security@altitude.app', initials: 'AL', isStarredSender: true },
    recipient: user.email,
    subject: 'New sign-in to your altitude account 🔐',
    snippet: `Your altitude account was signed in to at ${now.toLocaleString()}.`,
    body: `Hi there,\n\nThere was a new sign-in to your altitude account at ${now.toLocaleString()}.\n\nIf this was you — you're all set, no action needed.\nIf this wasn't you, sign out everywhere and contact your workspace admin right away.\n\n— altitude Security`,
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isRead: false, isStarred: false, category: 'primary', hasBlueIndicator: true, folder: 'inbox',
  };
  await client.from('mail_emails').insert(mapEmailToRow(msg) as any);
  res.json({ ok: true, delivered: true });
});

// ===========================================================================
// Serve built static files
// ===========================================================================
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath, { index: false }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexPath = path.join(distPath, 'mail.html');
  res.sendFile(indexPath, (err) => { if (err) next(); });
});

// Listen
if (process.env.RUN_SERVER === 'true') {
  const PORT = Number(process.env.PORT) || 3001;
  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`📬 altitude Mail Server running on port ${PORT}`);
  });
}
