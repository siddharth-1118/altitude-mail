import React, { useState } from 'react';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Clock,
  MoreVertical,
  Star,
  Sparkles,
  RotateCw,
  MessageSquare,
  AlertTriangle,
  Calendar,
  FileText,
  Download,
  Reply,
  Send,
  Check,
} from 'lucide-react';
import { Email } from '../../types/mail';

interface EmailDetailViewProps {
  email: Email;
  onBack: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenReply: (email: Email) => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({
  email,
  onBack,
  onArchive,
  onDelete,
  onToggleStar,
  onOpenReply,
}) => {
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isSendingQuickReply, setIsSendingQuickReply] = useState(false);
  const [quickReplySent, setQuickReplySent] = useState(false);

  const handleSendQuickReply = () => {
    if (!quickReplyText.trim()) return;
    setIsSendingQuickReply(true);
    setTimeout(() => {
      setIsSendingQuickReply(false);
      setQuickReplySent(true);
      setQuickReplyText('');
      setTimeout(() => setQuickReplySent(false), 3000);
    }, 600);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-email-back"
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={() => onArchive(email.id)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(email.id)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            title="Snooze"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStar(email.id)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                email.isStarred ? 'text-amber-400 fill-amber-400' : ''
              }`}
            />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>



      {/* Main Email Content Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Subject */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {email.subject}
          </h1>
        </div>

        {/* Sender Info Row */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {email.sender.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{email.sender.name}</span>
                <span className="text-xs text-slate-400">&lt;{email.sender.email}&gt;</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{email.recipient}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">{email.formattedDate}</span>
            <button
              onClick={() => onOpenReply(email)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Body */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {email.body}
        </div>

        {/* In-mail account confirmation action */}
        {email.confirmUrl && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-[#00a8b5]/25 bg-[#00a8b5]/5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
              altitude Security · account confirmation
            </p>
            <a
              href={email.confirmUrl}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00a8b5] text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              Confirm my altitude account
            </a>
          </div>
        )}

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              📎 {email.attachments.length} Attachment
            </h3>
            <div className="flex flex-wrap gap-3">
              {email.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-4 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all w-72"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                      <p className="text-[11px] text-slate-400">{att.size}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Downloading attachment: ${att.name}`)}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-purple-600 transition-colors shadow-xs"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reply className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-700">Quick Reply</span>
          </div>

          <button
            onClick={() => onOpenReply(email)}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Open in AI Canvas</span>
          </button>
        </div>

        <textarea
          value={quickReplyText}
          onChange={(e) => setQuickReplyText(e.target.value)}
          placeholder={`Reply to ${email.sender.name}...`}
          rows={3}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickReplyText('Thanks! I will review the details today and have all feedback submitted before the deadline.')}
              className="text-[11px] font-medium text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              ✨ "Will review today"
            </button>
            <button
              onClick={() => setQuickReplyText('Thanks for the update. The proposed time works for me.')}
              className="text-[11px] font-medium text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors hidden sm:inline"
            >
              ✨ "Time works"
            </button>
          </div>

          <button
            onClick={handleSendQuickReply}
            disabled={!quickReplyText.trim() || isSendingQuickReply}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            {quickReplySent ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Sent!</span>
              </>
            ) : isSendingQuickReply ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
