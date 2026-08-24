import React, { useState } from 'react';
import {
  Sparkles,
  Archive,
  AlertCircle,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';
import { Email, EmailCategory } from '../../types/mail';

interface InboxViewProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onNavigateToActionCenter: () => void;
  onDeleteEmails: (ids: string[]) => void;
  onArchiveEmails: (ids: string[]) => void;
  onMarkReadEmails: (ids: string[], isRead: boolean) => void;
  currentCategory: EmailCategory;
  onCategoryChange: (category: EmailCategory) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  onSelectEmail,
  onToggleStar,
  onNavigateToActionCenter,
  onDeleteEmails,
  onArchiveEmails,
  onMarkReadEmails,
  currentCategory,
  onCategoryChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredEmails = emails.filter((email) => email.category === currentCategory);
  const unreadCount = filteredEmails.filter((e) => !e.isRead).length;

  const isAllSelected =
    filteredEmails.length > 0 && selectedIds.length === filteredEmails.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleArchiveSelected = () => {
    if (selectedIds.length > 0) {
      onArchiveEmails(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      onDeleteEmails(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleMarkReadSelected = (read: boolean) => {
    if (selectedIds.length > 0) {
      onMarkReadEmails(selectedIds, read);
      setSelectedIds([]);
    }
  };

  const totalInbox = emails.filter((e) => e.folder === 'inbox').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbox</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalInbox} message{totalInbox === 1 ? '' : 's'} •{' '}
            <span className="font-semibold text-purple-600">{unreadCount} unread</span>
          </p>
        </div>
      </div>

      {/* AI Inbox Brief Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                AI Inbox Brief
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {totalInbox > 0
                ? `You have ${totalInbox} important email${totalInbox === 1 ? '' : 's'}, ${unreadCount} unread — your AI actions are waiting in the Action Center.`
                : 'Your inbox is empty — compose a message to get started.'}
            </p>
          </div>
        </div>

        <button
          id="btn-view-actions-banner"
          onClick={onNavigateToActionCenter}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex-shrink-0"
        >
          <span>View Actions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm text-slate-600">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500"
            title="Select All"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-purple-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            onClick={handleArchiveSelected}
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Report Spam"
          >
            <AlertCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-rose-600'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <button
            onClick={() => handleMarkReadSelected(true)}
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Mark as Read"
          >
            <MailOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleMarkReadSelected(false)}
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Mark as Unread"
          >
            <Mail className="w-4 h-4" />
          </button>

          <button
            disabled={selectedIds.length === 0}
            className={`p-1.5 rounded transition-colors ${
              selectedIds.length > 0
                ? 'hover:bg-slate-100 text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="Snooze"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>{filteredEmails.length} shown</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => onCategoryChange('primary')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            currentCategory === 'primary'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Primary</span>
        </button>

        <button
          onClick={() => onCategoryChange('promotions')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            currentCategory === 'promotions'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Promotions</span>
        </button>

        <button
          onClick={() => onCategoryChange('social')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            currentCategory === 'social'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Social</span>
        </button>

        <button
          onClick={() => onCategoryChange('updates')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            currentCategory === 'updates'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Updates</span>
        </button>
      </div>

      {/* Email List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
        {filteredEmails.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-500">No emails here yet.</p>
            <p className="text-xs text-slate-400 mt-1">New messages will appear in this category.</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSelected = selectedIds.includes(email.id);
            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`relative flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                  !email.isRead ? 'bg-white font-medium' : 'bg-slate-50/30 text-slate-600'
                }`}
              >
                {/* Blue indicator for unread email */}
                {!email.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r" />
                )}

                {/* Checkbox */}
                <button
                  onClick={(e) => toggleSelectOne(email.id, e)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Star */}
                <button
                  onClick={(e) => onToggleStar(email.id, e)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      email.isStarred
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </button>

                {/* Sender Initials Avatar / Name */}
                <div className="w-40 flex items-center gap-2.5 truncate flex-shrink-0">
                  <span
                    className={`truncate text-sm ${
                      !email.isRead ? 'font-bold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {email.sender.name}
                  </span>
                </div>

                {/* Priority badge & Snippet */}
                <div className="flex-1 flex items-center gap-2 truncate min-w-0">
                  {email.priorityBadge && (
                    <span className="flex-shrink-0 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                      {email.priorityBadge.text}
                    </span>
                  )}
                  <span
                    className={`text-sm truncate ${
                      !email.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {email.subject}
                  </span>
                  <span className="text-sm text-slate-400 truncate hidden sm:inline">
                    — {email.snippet}
                  </span>
                </div>

                {/* Date */}
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap pl-2 flex-shrink-0">
                  {email.timestamp}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
