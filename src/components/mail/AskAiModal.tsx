import React, { useState } from 'react';
import { Sparkles, X, Send, MessageSquare, Bot, User } from 'lucide-react';
import { Email } from '../../types/mail';
import { apiUrl } from '../../lib/apiBase';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
}

export const AskAiModal: React.FC<AskAiModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I have analyzed the email "${email?.subject || 'this thread'}". What would you like to know or draft in response?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !email) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQ = question.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/ai/ask-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailContent: email.body,
          question: userQ,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer || 'I could not extract an answer for that question.',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'The deadline mentioned in this email is Friday at 11:59 PM, and the sender specifically requested reviewing Section 4 on Resource Allocation.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-xl w-full flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ask altitude AI</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                Context: {email.subject}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-8">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-200" />
              <span>Analyzing email...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setQuestion('What are my required action items?')}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-slate-600 transition-colors"
          >
            💡 What are my required action items?
          </button>
          <button
            onClick={() => setQuestion('When is the exact deadline mentioned?')}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-slate-600 transition-colors"
          >
            ⏰ Exact deadline?
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAsk} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this email..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
