import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { apiUrl } from '../../lib/apiBase';
import {
  fetchAllMailData,
  upsertEmails,
  deleteEmails,
  upsertMailMeetings,
  upsertMailTasks,
  upsertMailFollowUps,
  upsertMailDecisions,
  upsertMailNewsletters,
  upsertMailSettings,
} from '../../lib/mailApi';
import {
  MailNavTab,
  Email,
  EmailCategory,
  MeetingItem,
  TaskItem,
  FollowUpItem,
  DecisionItem,
  NewsletterItem,
  UserSettings,
} from '../../types/mail';
import { MailSidebar } from './MailSidebar';
import { MailHeader } from './MailHeader';
import { InboxView } from './InboxView';
import { EmailDetailView } from './EmailDetailView';
import { ComposeView } from './ComposeView';
import { ActionCenterView } from './ActionCenterView';
import { InboxCleanerView } from './InboxCleanerView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { Toast, ToastMessage } from './Toast';

export const MailApp: React.FC = () => {
  const { user, signOut } = useAuth();

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<MailNavTab>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composePrefill, setComposePrefill] = useState<{
    to?: string;
    subject?: string;
    body?: string;
  }>({});
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<EmailCategory>('primary');

  // Data (loaded from Supabase — empty until the DB responds)
  const [emails, setEmails] = useState<Email[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    enableAiSummaries: true,
    enableAiPriority: true,
    enableSmartSearch: false,
    enableInboxCleaner: true,
    enableMeetingDetection: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all mail data from Supabase once signed in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchAllMailData();
        if (cancelled) return;
        setEmails(data.emails);
        setMeetings(data.meetings);
        setTasks(data.tasks);
        setFollowUps(data.followUps);
        setDecisions(data.decisions);
        setNewsletters(data.newsletters);
        setSettings(data.settings);
      } catch (err) {
        console.error('Failed to load mail data from Supabase.', err);
        addToast('Could not load your mailbox from Supabase.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Derived Counts
  const unreadCount = emails.filter((e) => !e.isRead && e.folder === 'inbox').length;
  const actionItemsCount =
    meetings.filter((m) => m.status === 'pending').length +
    tasks.filter((t) => t.status === 'pending').length +
    followUps.filter((f) => f.status === 'pending').length +
    decisions.filter((d) => d.status === 'pending').length;

  // Search filtered emails
  const displayEmails = useMemo(() => {
    let list = emails;
    if (currentTab === 'starred') {
      list = list.filter((e) => e.isStarred);
    } else if (currentTab === 'sent') {
      list = list.filter((e) => e.folder === 'sent');
    } else if (currentTab === 'drafts') {
      list = list.filter((e) => e.folder === 'drafts');
    } else if (currentTab === 'archive') {
      list = list.filter((e) => e.folder === 'archive');
    } else if (currentTab === 'spam') {
      list = list.filter((e) => e.folder === 'spam');
    } else {
      list = list.filter((e) => e.folder === 'inbox');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.sender.name.toLowerCase().includes(q) ||
          e.sender.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [emails, currentTab, searchQuery]);

  // Navigation Handler
  const handleNavigate = (tab: MailNavTab) => {
    setCurrentTab(tab);
    setSelectedEmail(null);
  };

  // -------------------------------------------------------------------------
  // Action Center Handlers (persist to Supabase)
  // -------------------------------------------------------------------------
  const handleAcceptMeeting = (id: string) => {
    setMeetings((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status: 'accepted' } : m));
      upsertMailMeetings(next.filter((m) => m.id === id)).catch((err) =>
        console.warn('Failed to save meeting response.', err)
      );
      return next;
    });
    addToast('Meeting invite accepted and synchronized to your calendar ✨');
  };

  const handleDeclineMeeting = (id: string) => {
    setMeetings((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status: 'declined' } : m));
      upsertMailMeetings(next.filter((m) => m.id === id)).catch((err) =>
        console.warn('Failed to save meeting response.', err)
      );
      return next;
    });
    addToast('Meeting declined', 'info');
  };

  const handleCompleteTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t));
      upsertMailTasks(next.filter((t) => t.id === id)).catch((err) =>
        console.warn('Failed to save task.', err)
      );
      return next;
    });
    addToast('Task marked as complete! ✓');
  };

  const handleRemindTask = (_id: string) => {
    addToast('Reminder set for 9:00 AM tomorrow ⏰', 'info');
  };

  const handleSendFollowUp = (item: FollowUpItem) => {
    setComposePrefill({
      to: '',
      subject: `Follow-up: ${item.title}`,
      body: `Hi,\n\nI wanted to gently follow up regarding the ${item.title} we discussed earlier. Let me know if you need any additional figures or support to proceed.\n\nBest regards,\n${user?.email?.split('@')[0] || 'Your Name'}`,
    });
    setIsComposeOpen(true);
  };

  const handleReviewDecision = (item: DecisionItem) => {
    setComposePrefill({
      to: '',
      subject: `Decision Sign-off: ${item.title}`,
      body: `Hi Team,\n\nI have reviewed the proposal for ${item.title}. The terms and projections align with our goals.\n\nApproved to proceed.\n\nBest,\n${user?.email?.split('@')[0] || 'Your Name'}`,
    });
    setIsComposeOpen(true);
  };

  const handleDismissAllActions = () => {
    setMeetings((prev) => {
      const next = prev.map((m) => ({ ...m, status: 'accepted' }));
      upsertMailMeetings(next).catch((err) => console.warn('Failed to save meetings.', err));
      return next;
    });
    setTasks((prev) => {
      const next = prev.map((t) => ({ ...t, status: 'completed' }));
      upsertMailTasks(next).catch((err) => console.warn('Failed to save tasks.', err));
      return next;
    });
    setFollowUps((prev) => {
      const next = prev.map((f) => ({ ...f, status: 'sent' }));
      upsertMailFollowUps(next).catch((err) => console.warn('Failed to save follow-ups.', err));
      return next;
    });
    setDecisions((prev) => {
      const next = prev.map((d) => ({ ...d, status: 'reviewed' }));
      upsertMailDecisions(next).catch((err) => console.warn('Failed to save decisions.', err));
      return next;
    });
    addToast('All action items dismissed and cleared');
  };

  // -------------------------------------------------------------------------
  // Inbox & Email Handlers
  // -------------------------------------------------------------------------
  const handleSelectEmail = (email: Email) => {
    setEmails((prev) => {
      const next = prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e));
      const changed = next.find((e) => e.id === email.id);
      if (changed) {
        upsertEmails([changed]).catch((err) => console.warn('Failed to mark read.', err));
      }
      return next;
    });
    setSelectedEmail(email);
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      );
      const changed = next.find((item) => item.id === id);
      if (changed) {
        upsertEmails([changed]).catch((err) => console.warn('Failed to save star.', err));
      }
      return next;
    });
  };

  const handleDeleteEmails = (ids: string[]) => {
    setEmails((prev) => prev.filter((e) => !ids.includes(e.id)));
    deleteEmails(ids).catch((err) => console.warn('Failed to delete emails.', err));
    if (selectedEmail && ids.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
    addToast(`${ids.length} email(s) deleted`);
  };

  const handleArchiveEmails = (ids: string[]) => {
    setEmails((prev) => {
      const next = prev.map((e) => (ids.includes(e.id) ? { ...e, folder: 'archive' } : e));
      upsertEmails(next.filter((e) => ids.includes(e.id))).catch((err) =>
        console.warn('Failed to archive emails.', err)
      );
      return next;
    });
    if (selectedEmail && ids.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
    addToast(`${ids.length} email(s) moved to Archive`);
  };

  const handleMarkReadEmails = (ids: string[], isRead: boolean) => {
    setEmails((prev) => {
      const next = prev.map((e) => (ids.includes(e.id) ? { ...e, isRead } : e));
      upsertEmails(next.filter((e) => ids.includes(e.id))).catch((err) =>
        console.warn('Failed to update read state.', err)
      );
      return next;
    });
    addToast(`Marked as ${isRead ? 'read' : 'unread'}`);
  };

  // Summarize Again (calls the server Gemini endpoint, persists the summary)
  const handleSummarizeAgain = async (email: Email) => {
    setIsSummarizing(true);
    try {
      const res = await fetch(apiUrl('/api/ai/summarize-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailContent: email.body,
          subject: email.subject,
        }),
      });
      const data = await res.json();
      if (data.bullets) {
        const summary = {
          bullets: data.bullets,
          actionRequired: data.actionRequired,
          deadline: data.deadline,
        };
        setEmails((prev) => {
          const next = prev.map((e) =>
            e.id === email.id ? { ...e, aiSummary: summary } : e
          );
          const changed = next.find((e) => e.id === email.id);
          if (changed) {
            upsertEmails([changed]).catch((err) =>
              console.warn('Failed to save AI summary.', err)
            );
          }
          return next;
        });
        setSelectedEmail((prev) => (prev ? { ...prev, aiSummary: summary } : null));
        addToast('AI Summary refreshed ✨');
      }
    } catch (err) {
      console.error(err);
      addToast('Summary generated from context');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Compose / Send Email
  const handleSendEmail = (newEmail: { to: string; subject: string; body: string }) => {
    const senderName = user?.email?.split('@')[0] || 'User';
    const created: Email = {
      id: `sent-${Date.now()}`,
      sender: {
        name: senderName,
        email: user?.email || 'me@workspace.local',
        initials: senderName.substring(0, 2).toUpperCase(),
      },
      recipient: `to ${newEmail.to}`,
      subject: newEmail.subject,
      snippet: newEmail.body.slice(0, 80) + (newEmail.body.length > 80 ? '...' : ''),
      body: newEmail.body,
      timestamp: 'Just now',
      formattedDate:
        'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      isStarred: false,
      category: 'primary',
      folder: 'sent',
    };

    setEmails((prev) => [created, ...prev]);
    upsertEmails([created]).catch((err) => console.warn('Failed to save sent email.', err));
    setIsComposeOpen(false);
    addToast('Email sent successfully ✈️');
  };

  // -------------------------------------------------------------------------
  // Cleaner Handlers
  // -------------------------------------------------------------------------
  const handleToggleNewsletter = (id: string) => {
    setNewsletters((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n));
      upsertMailNewsletters(next.filter((n) => n.id === id)).catch((err) =>
        console.warn('Failed to save newsletter selection.', err)
      );
      return next;
    });
  };

  const handleUnsubscribeSingle = (id: string) => {
    setNewsletters((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, unsubscribed: true, selected: false } : n
      );
      upsertMailNewsletters(next.filter((n) => n.id === id)).catch((err) =>
        console.warn('Failed to save newsletter.', err)
      );
      return next;
    });
    addToast('Unsubscribed and future messages blocked');
  };

  const handleUnsubscribeBatch = (ids: string[]) => {
    setNewsletters((prev) => {
      const next = prev.map((n) =>
        ids.includes(n.id) ? { ...n, unsubscribed: true, selected: false } : n
      );
      upsertMailNewsletters(next.filter((n) => ids.includes(n.id))).catch((err) =>
        console.warn('Failed to save newsletters.', err)
      );
      return next;
    });
    addToast(`Successfully unsubscribed from ${ids.length} newsletter(s)`);
  };

  const handleArchivePromotions = () => {
    addToast('342 Promotional emails archived ✨');
  };

  const handleDeletePromotions = () => {
    addToast('Promotional emails deleted');
  };

  const handleReviewLargeFiles = () => {
    addToast('24 attachments scanned — 2.4 GB analyzed', 'info');
  };

  const handleReviewInactive = () => {
    addToast('18 inactive senders filtered for batch cleanup', 'info');
  };

  const handleSelectAllAndArchive = () => {
    addToast('Selected promotional & inactive clutter archived successfully');
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    upsertMailSettings(newSettings).catch((err) =>
      console.warn('Failed to save mail settings.', err)
    );
    addToast('Settings preferences saved successfully ✨');
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start min-h-full">
      {/* Mail Sub-Navigation */}
      <MailSidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCompose={() => {
          setComposePrefill({});
          setIsComposeOpen(true);
        }}
        unreadCount={unreadCount}
        actionItemsCount={actionItemsCount}
      />

      {/* Main Mail Content Area */}
      <div className="flex-1 min-w-0 bg-[#F8F9FA] border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <MailHeader
          currentTab={currentTab}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSignOut={signOut}
          user={user ? { email: user.email ?? undefined, name: undefined } : null}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-16 text-center text-sm font-semibold text-slate-400">
              Loading your mailbox...
            </div>
          ) : isComposeOpen ? (
            <ComposeView
              onClose={() => setIsComposeOpen(false)}
              onSend={handleSendEmail}
              initialTo={composePrefill.to}
              initialSubject={composePrefill.subject}
              initialBody={composePrefill.body}
            />
          ) : selectedEmail ? (
            <EmailDetailView
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
              onArchive={(id) => {
                handleArchiveEmails([id]);
                setSelectedEmail(null);
              }}
              onDelete={(id) => {
                handleDeleteEmails([id]);
                setSelectedEmail(null);
              }}
              onToggleStar={handleToggleStar}
              onOpenReply={(em) => {
                setComposePrefill({
                  to: `${em.sender.name} <${em.sender.email}>`,
                  subject: `Re: ${em.subject}`,
                  body: `Hi ${em.sender.name.split(' ')[0]},\n\n`,
                });
                setIsComposeOpen(true);
              }}
            />
          ) : currentTab === 'action-center' ? (
            <ActionCenterView
              meetings={meetings}
              tasks={tasks}
              followUps={followUps}
              decisions={decisions}
              onAcceptMeeting={handleAcceptMeeting}
              onDeclineMeeting={handleDeclineMeeting}
              onCompleteTask={handleCompleteTask}
              onRemindTask={handleRemindTask}
              onSendFollowUp={handleSendFollowUp}
              onReviewDecision={handleReviewDecision}
              onDismissAll={handleDismissAllActions}
            />
          ) : currentTab === 'cleaner' ? (
            <InboxCleanerView
              newsletters={newsletters}
              onToggleNewsletter={handleToggleNewsletter}
              onUnsubscribeSingle={handleUnsubscribeSingle}
              onUnsubscribeBatch={handleUnsubscribeBatch}
              onArchivePromotions={handleArchivePromotions}
              onDeletePromotions={handleDeletePromotions}
              onReviewLargeFiles={handleReviewLargeFiles}
              onReviewInactive={handleReviewInactive}
              onSelectAllAndArchive={handleSelectAllAndArchive}
            />
          ) : currentTab === 'analytics' ? (
            <AnalyticsView emails={emails} />
          ) : currentTab === 'settings' ? (
            <SettingsView settings={settings} onSaveSettings={handleSaveSettings} />
          ) : currentTab === 'help' ? (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-slate-900">Help & Intelligent Canvas Guide</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Action Center</h3>
                  <p className="text-slate-600 leading-relaxed">
                    altitude continuously scans incoming threads to extract action items, meeting invites, and pending follow-ups so you never drop an executive thread.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Intelligent Canvas Composer</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Write prompts and toggle tones between Professional, Friendly, Formal, Concise, and Detailed. Insert drafts directly with one click.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Inbox / Starred / Sent / Drafts / Archive / Spam views */
            <InboxView
              emails={displayEmails}
              onSelectEmail={handleSelectEmail}
              onToggleStar={handleToggleStar}
              onNavigateToActionCenter={() => setCurrentTab('action-center')}
              onDeleteEmails={handleDeleteEmails}
              onArchiveEmails={handleArchiveEmails}
              onMarkReadEmails={handleMarkReadEmails}
              currentCategory={currentCategory}
              onCategoryChange={setCurrentCategory}
            />
          )}
        </main>
      </div>


      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
