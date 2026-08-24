import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  Link2,
  Smile,
  Type,
  Calendar,
  RotateCw,
  Scissors,
  CheckCheck,
  ArrowRight,
  Maximize2,
  Minus,
  X,
  Check,
} from 'lucide-react';
import { ToneType } from '../../types/mail';
import { apiUrl } from '../../lib/apiBase';
import confetti from 'canvas-confetti';

interface ComposeViewProps {
  onClose: () => void;
  onSend: (email: { to: string; subject: string; body: string }) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export const ComposeView: React.FC<ComposeViewProps> = ({
  onClose,
  onSend,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
}) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState('');

  // AI Assistant Canvas State
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedDraft, setSuggestedDraft] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const tones: ToneType[] = ['Professional', 'Friendly', 'Formal', 'Concise', 'Detailed'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch(apiUrl('/api/ai/generate-draft'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone: selectedTone,
          subject,
          context: to,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setSuggestedDraft(data.draft);
      }
    } catch (err) {
      console.error('Draft generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (action: 'shorten' | 'grammar' | 'tone', targetTone?: ToneType) => {
    if (!suggestedDraft.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(apiUrl('/api/ai/refine-draft'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: suggestedDraft,
          action,
          targetTone,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setSuggestedDraft(data.draft);
      }
    } catch (err) {
      console.error('Refine draft error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertDraft = () => {
    if (suggestedDraft.trim()) {
      setBody(suggestedDraft);
    }
  };

  const handleSendEmail = () => {
    if (!to.trim()) {
      alert('Please specify a recipient');
      return;
    }
    // trigger delightful confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    onSend({ to, subject, body });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Intelligent Compose Canvas
            </h1>
            <p className="text-xs text-slate-500">
              Draft with Gemini AI acceleration and tone precision.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Composer Window (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            {/* Window Top Bar */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide">New Message</span>
              <div className="flex items-center gap-2 text-slate-400">
                <Minus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <X onClick={onClose} className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Email Header Fields */}
            <div className="p-4 space-y-3 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-400 w-12">To:</span>
                <input
                  id="compose-to"
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1 text-xs text-slate-800 focus:outline-none bg-transparent"
                  placeholder="Recipients..."
                />
                <button
                  type="button"
                  onClick={() => setShowCc(!showCc)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-purple-600 transition-colors"
                >
                  Cc/Bcc
                </button>
              </div>

              {showCc && (
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-400 w-12">Cc:</span>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 text-xs text-slate-800 focus:outline-none bg-transparent"
                    placeholder="Cc recipients..."
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-12">Subject:</span>
                <input
                  id="compose-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 text-xs font-semibold text-slate-900 focus:outline-none bg-transparent"
                  placeholder="Subject line..."
                />
              </div>
            </div>

            {/* Text Editor Area */}
            <div className="p-4">
              <textarea
                id="compose-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your message or use the altitude Assistant on the right to generate a pristine draft..."
                rows={14}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed bg-transparent"
              />
            </div>
          </div>

          {/* Bottom Toolbar & Send Button */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-1 text-slate-500">
              <button
                className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                title="Formatting options"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                title="Insert link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                title="Insert emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-600 transition-colors"
                title="Schedule send"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-send-email"
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: altitude Assistant Intelligent Canvas (6 cols) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 border border-purple-200 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                altitude Assistant
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full">
              Intelligent Canvas
            </span>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              What do you want to write?
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="e.g., Write a professional email asking for an extension on the Q3 report..."
                className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none shadow-xs"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-2.5 bottom-3 w-7 h-7 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center shadow-xs transition-colors"
                title="Generate with Gemini"
              >
                <ArrowRight className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tone Adjust Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tone Adjust
            </span>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => {
                    setSelectedTone(tone);
                    handleRefine('tone', tone);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedTone === tone
                      ? 'bg-purple-600 text-white shadow-xs font-semibold'
                      : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Draft Box */}
          <div className="bg-white border border-purple-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Suggested Draft
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRefine('shorten')}
                  disabled={isGenerating || !suggestedDraft}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Shorten</span>
                </button>

                <button
                  onClick={() => handleRefine('grammar')}
                  disabled={isGenerating || !suggestedDraft}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  <CheckCheck className="w-3 h-3 text-purple-600" />
                  <span>Fix Grammar</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                  title="Regenerate"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-lg text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
              {suggestedDraft || (
                <span className="italic text-slate-400">
                  Generate a draft above to see it here.
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
              >
                {showComparison ? 'Hide Comparison' : 'Live Comparison'}
              </button>

              <button
                id="btn-insert-draft"
                onClick={handleInsertDraft}
                disabled={!suggestedDraft}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Draft</span>
              </button>
            </div>
          </div>

          {/* Live Comparison View */}
          {showComparison && (
            <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-700">Live Diff / Current vs Suggested:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded border border-slate-200 max-h-32 overflow-y-auto text-[11px]">
                  <span className="font-semibold text-slate-400 block mb-1">Current in Editor:</span>
                  {body || <span className="italic text-slate-400">(Empty editor)</span>}
                </div>
                <div className="bg-purple-50/50 p-2 rounded border border-purple-200 max-h-32 overflow-y-auto text-[11px]">
                  <span className="font-semibold text-purple-700 block mb-1">AI Suggestion:</span>
                  {suggestedDraft || <span className="italic text-slate-400">(No draft yet)</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
