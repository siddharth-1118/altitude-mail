import { getAuthUser, isAltitudeEmail } from '../lib/supabase.js';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt, tone = 'Professional', subject = '', context = '' } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  if (!apiKey) {
    // Fallback without AI
    return res.json({
      draft: `Dear [Name],\n\nI am writing to you regarding ${subject || 'the project'}. ${prompt}\n\nBest regards,\n[Your Name]`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { systemInstruction, temperature: 0.7 },
    });

    return res.json({ draft: response.text?.trim() || '' });
  } catch (err) {
    console.error('Draft generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate draft' });
  }
}
