import React from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Mail,
  Scale,
  Clock,
  Check,
  X,
  Send,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { MeetingItem, TaskItem, FollowUpItem, DecisionItem } from '../../types/mail';

interface ActionCenterViewProps {
  meetings: MeetingItem[];
  tasks: TaskItem[];
  followUps: FollowUpItem[];
  decisions: DecisionItem[];
  onAcceptMeeting: (id: string) => void;
  onDeclineMeeting: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onRemindTask: (id: string) => void;
  onSendFollowUp: (item: FollowUpItem) => void;
  onReviewDecision: (item: DecisionItem) => void;
  onDismissAll: () => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  meetings,
  tasks,
  followUps,
  decisions,
  onAcceptMeeting,
  onDeclineMeeting,
  onCompleteTask,
  onRemindTask,
  onSendFollowUp,
  onReviewDecision,
  onDismissAll,
}) => {
  const pendingMeetings = meetings.filter((m) => m.status === 'pending');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const pendingDecisions = decisions.filter((d) => d.status === 'pending');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Action Center</h1>
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Actionable intelligence extracted from your inbox.
          </p>
        </div>

        <button
          id="btn-dismiss-all-actions"
          onClick={onDismissAll}
          className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          Dismiss All
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Meetings Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Meetings</h2>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                {pendingMeetings.length} requests detected
              </span>
            </div>

            {pendingMeetings.length > 0 ? (
              <div className="space-y-3">
                {pendingMeetings.map((meet) => (
                  <div
                    key={meet.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">{meet.title}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">{meet.dateStr}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meet.timeframe}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onAcceptMeeting(meet.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onDeclineMeeting(meet.id)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => alert(`Proposing alternative times for ${meet.title}`)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Suggest Time
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                All meeting requests have been handled.
              </div>
            )}
          </div>
        </div>

        {/* 2. Tasks Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Tasks</h2>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {pendingTasks.length} tasks detected
              </span>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{task.title}</span>
                      </div>
                      {task.isHighPriority && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">From: {task.from}</p>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onCompleteTask(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark complete</span>
                      </button>
                      <button
                        onClick={() => onRemindTask(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Remind me</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active pending tasks.
              </div>
            )}
          </div>
        </div>

        {/* 3. Follow-ups Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Follow-ups</h2>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                {pendingFollowUps.length} emails require follow-up
              </span>
            </div>

            {pendingFollowUps.length > 0 ? (
              <div className="space-y-3">
                {pendingFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-800 text-sm">{fu.title}</h3>
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Waiting for response from {fu.waitingFor}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onSendFollowUp(fu)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Send follow-up</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                All follow-ups are up to date.
              </div>
            )}
          </div>
        </div>

        {/* 4. Important Decisions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Important Decisions</h2>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {pendingDecisions.length} item requires input
              </span>
            </div>

            {pendingDecisions.length > 0 ? (
              <div className="space-y-3">
                {pendingDecisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-800 text-sm">{dec.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {dec.description}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onReviewDecision(dec)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <span>Review Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No decisions pending review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
