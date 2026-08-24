import React, { useState } from 'react';
import {
  Sparkles,
  Archive,
  Trash2,
  Mail,
  HardDrive,
  UserX,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';
import { NewsletterItem } from '../../types/mail';

interface InboxCleanerViewProps {
  newsletters: NewsletterItem[];
  onToggleNewsletter: (id: string) => void;
  onUnsubscribeSingle: (id: string) => void;
  onUnsubscribeBatch: (ids: string[]) => void;
  onArchivePromotions: () => void;
  onDeletePromotions: () => void;
  onReviewLargeFiles: () => void;
  onReviewInactive: () => void;
  onSelectAllAndArchive: () => void;
}

export const InboxCleanerView: React.FC<InboxCleanerViewProps> = ({
  newsletters,
  onToggleNewsletter,
  onUnsubscribeSingle,
  onUnsubscribeBatch,
  onArchivePromotions,
  onDeletePromotions,
  onReviewLargeFiles,
  onReviewInactive,
  onSelectAllAndArchive,
}) => {
  const [promoArchived, setPromoArchived] = useState(false);
  const selectedNewsletterIds = newsletters
    .filter((n) => n.selected && !n.unsubscribed)
    .map((n) => n.id);

  const activeNewsletters = newsletters.filter((n) => !n.unsubscribed);

  const isAllNewslettersSelected =
    activeNewsletters.length > 0 &&
    activeNewsletters.every((n) => n.selected);

  const toggleSelectAllNewsletters = () => {
    if (isAllNewslettersSelected) {
      activeNewsletters.forEach((n) => {
        if (n.selected) onToggleNewsletter(n.id);
      });
    } else {
      activeNewsletters.forEach((n) => {
        if (!n.selected) onToggleNewsletter(n.id);
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Inbox Cleaner</h1>
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intelligently organizing your workflow.
          </p>
        </div>

        <button
          id="btn-select-all-archive"
          onClick={onSelectAllAndArchive}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Archive className="w-4 h-4" />
          <span>Select all and Archive</span>
        </button>
      </div>

      {/* Hero Health Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 border border-purple-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeNewsletters.length} newsletter{activeNewsletters.length === 1 ? '' : 's'} detected
            </h2>
            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Optimal Health — clean up subscriptions with low engagement</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-700 block">Space Reclaimed</span>
            <span className="text-sm font-extrabold text-purple-700">3.8 GB clean</span>
          </div>
        </div>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Promotional */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                HIGH VOL
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">342 Promotional</h3>
            <p className="text-xs text-slate-500 mt-1">Marketing emails & automated notifications</p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onArchivePromotions();
                setPromoArchived(true);
              }}
              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {promoArchived ? 'Archived ✓' : 'Archive All'}
            </button>
            <button
              onClick={onDeletePromotions}
              className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
              title="Delete All"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Newsletters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                {activeNewsletters.length} Active
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">87 Newsletters</h3>
            <p className="text-xs text-slate-500 mt-1">Subscriptions with low reading engagement</p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                const el = document.getElementById('newsletters-table');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Review
            </button>
            <button
              onClick={() => onUnsubscribeBatch(selectedNewsletterIds)}
              disabled={selectedNewsletterIds.length === 0}
              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Unsubscribe
            </button>
          </div>
        </div>

        {/* 3. Large Files */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                2.4 GB
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">24 Large Files</h3>
            <p className="text-xs text-slate-500 mt-1">Attachments taking up excessive storage</p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onReviewLargeFiles}
              className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Review Size
            </button>
          </div>
        </div>

        {/* 4. Inactive */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <UserX className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                &gt; 90 days
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">18 Inactive</h3>
            <p className="text-xs text-slate-500 mt-1">Senders unopened for more than 3 months</p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onReviewInactive}
              className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Review & Unsubscribe
            </button>
          </div>
        </div>
      </div>

      {/* Detected Newsletters Table */}
      <div id="newsletters-table" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Detected Newsletters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select recurring newsletters to instantly remove and block future delivery.
            </p>
          </div>

          <button
            onClick={() => onUnsubscribeBatch(selectedNewsletterIds)}
            disabled={selectedNewsletterIds.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
          >
            <span>Unsubscribe Selected ({selectedNewsletterIds.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAllNewsletters} className="p-1">
                    {isAllNewslettersSelected ? (
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-4">Newsletter / Sender</th>
                <th className="p-4">Engagement Activity</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeNewsletters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No newsletters detected yet.
                  </td>
                </tr>
              ) : (
                newsletters.map((nl) => (
                  <tr
                    key={nl.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      nl.unsubscribed ? 'opacity-40 line-through bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onToggleNewsletter(nl.id)}
                        disabled={nl.unsubscribed}
                        className="p-1"
                      >
                        {nl.selected && !nl.unsubscribed ? (
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs ${nl.bgColor}`}
                        >
                          {nl.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{nl.name}</div>
                          <div className="text-[11px] text-slate-400">{nl.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500">{nl.activity}</td>

                    <td className="p-4 text-right">
                      {nl.unsubscribed ? (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Unsubscribed
                        </span>
                      ) : (
                        <button
                          onClick={() => onUnsubscribeSingle(nl.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
