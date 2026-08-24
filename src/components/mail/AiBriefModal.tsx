import React from 'react';
import { Sparkles, X, Calendar, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { MailNavTab } from '../../types/mail';

interface AiBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: MailNavTab) => void;
}

export const AiBriefModal: React.FC<AiBriefModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Executive Morning Brief
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Here's what needs your focus today
          </h2>
          <p className="text-xs text-purple-100/80 mt-1">
            Processed your latest messages across primary and priority channels.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 block">Meeting Requests</span>
              <p className="text-slate-600 mt-0.5">
                Pending invites waiting for your response live in the Action Center.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 block">Tasks & Deadlines</span>
              <p className="text-slate-600 mt-0.5">
                High-priority tasks and decisions detected from your threads.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 block">Follow-ups</span>
              <p className="text-slate-600 mt-0.5">
                Conversations waiting on a reply — one click to draft a nudge.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigate('action-center');
              }}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Go to Action Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
