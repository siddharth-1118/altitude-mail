import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Eye,
  Inbox,
  Bell,
  Shield,
  User,
  Check,
} from 'lucide-react';
import { UserSettings } from '../../types/mail';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'general' | 'appearance' | 'inbox' | 'notifications' | 'security' | 'account'>('ai');
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const subTabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Settings', icon: Sparkles, isAi: true },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
  ];

  const handleToggle = (key: keyof UserSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDiscard = () => {
    setLocalSettings({ ...settings });
    setIsSaved(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mail Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your email client preferences, security, and AI assistant intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sub-nav (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm space-y-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-purple-600'
                        : tab.isAi
                        ? 'text-purple-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>
                {tab.isAi && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Settings Panel (8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {activeSubTab === 'ai' ? (
            <>
              {/* AI Settings Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">AI Settings</h2>
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure how altitude AI enhances your daily email experience.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-5 divide-y divide-slate-100">
                {/* 1. Summaries */}
                <div className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-900">Enable AI summaries</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically generate key takeaways and actionable summaries for incoming emails.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.enableAiSummaries}
                      onChange={() => handleToggle('enableAiSummaries')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>

                {/* 2. Priority */}
                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-900">Enable AI priority</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Highlight high priority emails with intelligent deadline and context flags.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.enableAiPriority}
                      onChange={() => handleToggle('enableAiPriority')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>

                {/* 3. Smart Search */}
                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-900">Enable smart search</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Use AI-powered semantic search across your entire mailbox and attachment documents.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.enableSmartSearch}
                      onChange={() => handleToggle('enableSmartSearch')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>

                {/* 4. Inbox Cleaner */}
                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-900">Enable inbox cleaner</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically detect newsletters, stale threads, and promotional spam for bulk cleanup.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.enableInboxCleaner}
                      onChange={() => handleToggle('enableInboxCleaner')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>

                {/* 5. Meeting Detection */}
                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-900">Enable meeting detection</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically extract meeting requests and suggest schedule blocks in Action Center.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={localSettings.enableMeetingDetection}
                      onChange={() => handleToggle('enableMeetingDetection')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                  </label>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Preferences Saved!</span>
                    </>
                  ) : (
                    <span>Save Preferences</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {activeSubTab} Configuration
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Standard configuration options are pre-optimized. Switch to <strong>AI Settings</strong> to customize smart capabilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
