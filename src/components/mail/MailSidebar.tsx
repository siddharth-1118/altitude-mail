import React from 'react';
import {
  Inbox,
  CheckSquare,
  Star,
  Send,
  FileText,
  Archive,
  AlertCircle,
  Settings,
  HelpCircle,
  Plus,
  BarChart3,
} from 'lucide-react';
import { MailNavTab } from '../../types/mail';

interface MailSidebarProps {
  currentTab: MailNavTab;
  onNavigate: (tab: MailNavTab) => void;
  onOpenCompose: () => void;
  unreadCount: number;
  actionItemsCount: number;
}

export const MailSidebar: React.FC<MailSidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenCompose,
  unreadCount,
  actionItemsCount,
}) => {
  const mainNavItems = [
    {
      id: 'inbox' as MailNavTab,
      label: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'action-center' as MailNavTab,
      label: 'Action Center',
      icon: CheckSquare,
      badge: actionItemsCount > 0 ? `${actionItemsCount} new` : undefined,
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'analytics' as MailNavTab,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'starred' as MailNavTab,
      label: 'Starred',
      icon: Star,
    },
    {
      id: 'sent' as MailNavTab,
      label: 'Sent',
      icon: Send,
    },
    {
      id: 'drafts' as MailNavTab,
      label: 'Drafts',
      icon: FileText,
    },
    {
      id: 'archive' as MailNavTab,
      label: 'Archive',
      icon: Archive,
    },
    {
      id: 'spam' as MailNavTab,
      label: 'Spam',
      icon: AlertCircle,
    },
  ];

  return (
    <aside className="w-full lg:w-56 flex-shrink-0 bg-white border border-slate-200/80 flex flex-col select-none rounded-2xl overflow-hidden shadow-sm self-start lg:sticky lg:top-0">
      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between lg:justify-start">
        {/* Brand Header */}
        <div className="p-4 pb-3 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">altitude Mail</h1>
            <p className="text-[10px] text-slate-500 font-medium">Workspace Mail</p>
          </div>
        </div>

        {/* Compose Button */}
        <div className="px-3 py-2 flex-shrink-0 sm:w-40 lg:w-auto">
          <button
            id="btn-sidebar-compose"
            onClick={onOpenCompose}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Compose</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="px-2.5 py-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:gap-0.5 scrollbar-none w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex-shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 mr-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-purple-600'
                        : item.isAi
                        ? 'text-purple-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Nav */}
      <div className="p-2.5 border-t border-slate-100 flex flex-row lg:flex-col justify-end lg:justify-start gap-1 lg:gap-0.5">
        <button
          id="nav-settings"
          onClick={() => onNavigate('settings')}
          className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-purple-50 text-purple-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
        <button
          id="nav-help"
          onClick={() => onNavigate('help')}
          className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'help'
              ? 'bg-purple-50 text-purple-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  );
};
