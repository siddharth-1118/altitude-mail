import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { mailApiUrl } from '../lib/mailApiBase';
import { supabase } from '../lib/supabase';

interface ConfirmPageProps {
  token: string;
  onDone: () => void;
}

type State = 'loading' | 'success' | 'error';

export const ConfirmPage: React.FC<ConfirmPageProps> = ({ token, onDone }) => {
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase!.auth.getSession();
        const res = await fetch(mailApiUrl('/api/auth/confirm'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ token }),
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json.ok) {
          setState('success');
        } else {
          setState('error');
          setMessage(json.error || 'This confirmation link is invalid or has expired.');
        }
      } catch {
        if (!cancelled) {
          setState('error');
          setMessage('Could not reach the altitude server. Check your connection and try again.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f3f7fb] flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl neo-well mx-auto flex items-center justify-center">
            {state === 'success' ? (
              <CheckCircle2 className="w-7 h-7 text-[#00a8b5]" />
            ) : state === 'error' ? (
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            ) : (
              <Loader2 className="w-7 h-7 text-[#00a8b5] animate-spin" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {state === 'success'
              ? 'Your account is confirmed!'
              : state === 'error'
                ? 'Confirmation failed'
                : 'Confirming your account…'}
          </h1>
        </div>

        <div className="neo-card p-6 sm:p-8 space-y-6">
          {state === 'loading' && (
            <p className="text-sm text-slate-500 text-center font-medium">
              Verifying your confirmation link…
            </p>
          )}

          {state === 'success' && (
            <>
              <p className="text-sm text-slate-600 leading-relaxed text-center">
                Your altitude account is active. Your mailbox, meetings, and AI memory are ready for you.
              </p>
              <button
                onClick={onDone}
                className="w-full py-3.5 rounded-2xl neo-raised-hover font-bold text-sm text-[#00a8b5] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Enter altitude Workspace
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <p className="text-sm text-slate-600 leading-relaxed text-center">{message}</p>
              <button
                onClick={onDone}
                className="w-full py-3.5 rounded-2xl neo-raised-hover font-bold text-sm text-[#00a8b5] cursor-pointer transition-all"
              >
                Back to altitude
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
