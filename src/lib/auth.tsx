import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { mailApiUrl } from './mailApiBase';

export interface AuthResult {
  error: string | null;
  /** true when sign-up succeeded but the user must confirm their email first */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** false while a confirmation link is pending in the user's altitude mailbox */
  confirmed: boolean | null;
  refreshConfirmation: () => Promise<void>;
  /** Re-delivers the in-mail confirmation and returns the confirm URL (or null). */
  resendConfirmation: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

// Altitude email validation — only @altitude domain emails are accepted
const ALTITUDE_EMAIL_REGEX = /^[\w.-]+@altitude\.com$/i;

export function isAltitudeEmail(email: string): boolean {
  return ALTITUDE_EMAIL_REGEX.test(email.trim());
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  confirmed: true,
  refreshConfirmation: async () => {},
  resendConfirmation: async () => null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState<boolean | null>(true);

  const refreshConfirmation = useCallback(async () => {
    if (!supabase) {
      setConfirmed(true);
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setConfirmed(true);
      return;
    }
    try {
      const res = await fetch(mailApiUrl('/api/auth/status'), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setConfirmed(json.confirmed !== false);
      } else {
        // Server unreachable — never lock the user out because of that.
        setConfirmed(true);
      }
    } catch {
      setConfirmed(true);
    }
  }, []);

  const resendConfirmation = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;
    try {
      const res = await fetch(mailApiUrl('/api/auth/deliver-confirmation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ origin: window.location.origin }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return typeof json.confirmUrl === 'string' ? json.confirmUrl : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setConfirmed(true);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
        setLoading(false);
        if (data.session) refreshConfirmation();
      })
      .catch(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) refreshConfirmation();
    });

    return () => subscription.unsubscribe();
  }, [refreshConfirmation]);

  // Delivers a "New sign-in" notification to the user's own altitude mailbox.
  // Runs through our server API — no email provider involved.
  const notifySignin = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await fetch(mailApiUrl('/api/auth/notify-signin'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch {
      // non-critical — never block sign-in on the notification
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: 'Supabase is not configured.' };
      if (!isAltitudeEmail(email)) {
        return { error: 'Only @altitude.com emails are accepted. Please use your altitude workspace email.' };
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) notifySignin();
      return { error: error?.message ?? null };
    },
    [notifySignin]
  );

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Supabase is not configured.' };
    if (!isAltitudeEmail(email)) {
      return { error: 'Only @altitude.com emails are accepted. Please use your altitude workspace email.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If Supabase's own email confirmation is ever enabled, the link returns here.
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message || '';
      if (/rate limit|rate_limit|too many requests|429/i.test(msg)) {
        return {
          error:
            'Supabase email rate limit reached. Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email — altitude confirms accounts through its own Mail, so no emails are needed. Wait a few minutes, then try again.',
        };
      }
      return { error: msg };
    }

    // The account exists. Deliver the confirmation link to the user's OWN
    // altitude mailbox (no external email). We await it so the app can show
    // the confirmation gate with the message already in the inbox.
    if (data.session) {
      await resendConfirmation();
      await refreshConfirmation();
      notifySignin();
    }

    // If a session exists, confirmation is handled inside the app (the
    // ConfirmationGate). Otherwise Supabase's own email confirmation is still
    // enabled — turn it OFF so altitude can confirm accounts via its own Mail.
    return {
      error: data.session
        ? null
        : 'Account created! Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email, then sign up again so altitude can confirm you via your workspace Mail.',
      needsEmailConfirmation: !data.session,
    };
  }, [refreshConfirmation, resendConfirmation, notifySignin]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setConfirmed(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, confirmed, refreshConfirmation, resendConfirmation, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
