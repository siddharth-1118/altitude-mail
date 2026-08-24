import React, { useState } from 'react';
import { Search, Bell, Settings, LogOut, Sparkles } from 'lucide-react';
import { MailNavTab } from '../../types/mail';

interface MailHeaderProps {
  currentTab: MailNavTab;
  onNavigate: (tab: MailNavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSignOut: () => void;
  user: { email?: string; name?: string } | null;
  unreadCount: number;
}

export const MailHeader: React.FC<MailHeaderProps> = ({
  onNavigate,
  searchQuery,
  onSearchChange,
  onSignOut,
  user,
  unreadCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName =
    user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 rounded-t-2xl">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search mail, tasks, or attachments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/70 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">Action Alerts</span>
                <span className="text-xs text-purple-600 bg-purple-50 font-medium px-2 py-0.5 rounded-full">
                  System Alerts
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onNavigate('action-center')}>
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Meeting Requests</span>
                    <span className="text-[10px] text-slate-400">Now</span>
                  </div>
                  <p className="text-slate-600 mt-1">Pending invites are waiting in your Action Center.</p>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onNavigate('action-center')}>
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Tasks & Deadlines</span>
                    <span className="text-[10px] text-slate-400">Today</span>
                  </div>
                  <p className="text-slate-600 mt-1">High-priority tasks extracted from your threads.</p>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onNavigate('cleaner')}>
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Inbox Cleaner</span>
                    <span className="text-[10px] text-slate-400">Today</span>
                  </div>
                  <p className="text-slate-600 mt-1">Newsletters ready for one-click cleanup.</p>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('action-center');
                  }}
                  className="w-full text-center text-xs font-semibold text-purple-600 hover:text-purple-700 py-1"
                >
                  View all in Action Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          id="btn-settings-header"
          onClick={() => onNavigate('settings')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile / Sign Out */}
        <div className="relative">
          <button
            id="btn-profile-toggle"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              {initials || 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-sm text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'signed in'}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md w-fit">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>altitude Workspace</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Mail Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
