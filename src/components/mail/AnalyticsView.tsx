import React, { useState } from 'react';
import {
  Mail,
  Send,
  MailOpen,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { Email } from '../../types/mail';

interface AnalyticsViewProps {
  emails?: Email[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ emails = [] }) => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Real KPI counts derived from the user's actual mailbox
  const received = emails.filter((e) => e.folder === 'inbox').length;
  const sent = emails.filter((e) => e.folder === 'sent').length;
  const unread = emails.filter((e) => !e.isRead && e.folder === 'inbox').length;
  const aiSummarized = emails.filter((e) => e.aiSummary && e.aiSummary.bullets?.length).length;

  // Volume Data over time (demo shape — real per-day buckets can be added later)
  const volumeData = [
    { date: 'Nov 1', count: 68 },
    { date: 'Nov 4', count: 85 },
    { date: 'Nov 7', count: 72 },
    { date: 'Nov 10', count: 95 },
    { date: 'Nov 13', count: 110 },
    { date: 'Nov 15', count: 135, isPeak: true },
    { date: 'Nov 18', count: 92 },
    { date: 'Nov 21', count: 104 },
    { date: 'Nov 24', count: 88 },
    { date: 'Nov 27', count: 115 },
    { date: 'Nov 30', count: 76 },
  ];

  // Inbox Composition Data
  const categoryCounts: Record<string, number> = {};
  emails.forEach((e) => {
    if (e.folder === 'inbox') {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    }
  });
  const totalInbox = Math.max(Object.values(categoryCounts).reduce((a, b) => a + b, 0), 1);
  const compositionData = [
    { name: 'Work', value: Math.round(((categoryCounts.primary || 0) / totalInbox) * 100), color: '#7C3AED' },
    { name: 'Personal', value: Math.round(((categoryCounts.social || 0) / totalInbox) * 100), color: '#3B82F6' },
    { name: 'Social/Promo', value: Math.round(((categoryCounts.promotions || 0) / totalInbox) * 100), color: '#10B981' },
    { name: 'Spam/Junk', value: Math.round(((categoryCounts.updates || 0) / totalInbox) * 100), color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  // Response Time Data (demo trend)
  const responseTimeData = [
    { week: 'W1', hours: 5.2 },
    { week: 'W2', hours: 4.6 },
    { week: 'W3', hours: 3.8 },
    { week: 'W4', hours: 3.1 },
    { week: 'W5', hours: 2.7 },
    { week: 'W6', hours: 2.4 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of your intelligent communication patterns.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl shadow-xs self-start sm:self-auto">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {range} Days
            </button>
          ))}
        </div>
      </div>

      {/* 5 KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Received */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Emails Received</span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{received}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>in your inbox</span>
          </div>
        </div>

        {/* Sent */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Emails Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{sent}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>total sent</span>
          </div>
        </div>

        {/* Unread */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Unread</span>
            <MailOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{unread}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <span>— awaiting review</span>
          </div>
        </div>

        {/* Avg Response */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg Response</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">2.4h</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-0.5h improvement</span>
          </div>
        </div>

        {/* AI Summaries */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 border border-purple-200 rounded-2xl p-4 shadow-sm space-y-2 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold">AI Summaries</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-950">{aiSummarized}</div>
          <div className="text-[11px] font-semibold text-purple-700">
            Generated on your emails
          </div>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Email Volume Over Time (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Email Volume Over Time</h2>
              <p className="text-xs text-slate-500">Daily incoming and outgoing communication density</p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              Peak: Nov 15 (135)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '10px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {volumeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? '#7C3AED' : '#C4B5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Inbox Composition (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inbox Composition</h2>
            <p className="text-xs text-slate-500">Breakdown of communication categories</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {compositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No inbox emails to analyze yet.</p>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {compositionData.length > 0 ? (
              compositionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
                </div>
              ))
            ) : (
              <span className="text-slate-400 text-xs col-span-2">No data</span>
            )}
          </div>
        </div>
      </div>

      {/* Response Time Trend Smooth Area Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Response Time Trend</h2>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Optimized
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Average response turnaround time has decreased 53% with intelligent draft suggestions
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-slate-900">2.4 hours</span>
            <span className="text-xs text-emerald-600 font-semibold block">53% Faster</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#7C3AED"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
