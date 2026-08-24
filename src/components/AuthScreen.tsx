import React, { useState } from 'react';
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Video,
  Brain,
  Mic,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth, isAltitudeEmail } from '../lib/auth';

interface AuthScreenProps {
  title?: string;
  subtitle?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  title = 'altitude Workspace',
  subtitle = 'Sign in to access meetings, AI memory, and recordings.',
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setNotice(null);

    // Client-side altitude email validation
    if (!isAltitudeEmail(email.trim())) {
      setError('Only @altitude.com emails are accepted. Please use your altitude workspace email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === 'signin'
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);
      if (result.error) {
        if (result.needsEmailConfirmation) {
          setNotice(result.error);
        } else {
          setError(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const features = [
    { icon: <Video className="w-5 h-5" />, text: 'HD Video Meetings with AI Memory' },
    { icon: <Brain className="w-5 h-5" />, text: 'Gemini-Powered Meeting Summaries' },
    { icon: <Mic className="w-5 h-5" />, text: 'Real-time Transcription & Captions' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#f3f7fb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        }}
        className="auth-container"
      >
        {/* Left — Brand Panel */}
        <div
          style={{
            width: '42%',
            background: 'linear-gradient(135deg, #00a8b5 0%, #0090a0 50%, #006b75 100%)',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="brand-panel"
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>altitude</span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
              Your all-in-one<br />workspace platform
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: '280px', lineHeight: 1.6 }}>
              {subtitle}
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: '2.5rem' }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              End-to-end encrypted · SOC 2 compliant
            </span>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div
          style={{
            width: '58%',
            background: 'white',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          className="form-panel"
        >
          <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                {mode === 'signin'
                  ? 'Sign in to your altitude workspace'
                  : 'Start using altitude in seconds'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '1.5rem' }}>
              <button
                onClick={() => switchMode('signin')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                  ...(mode === 'signin'
                    ? { background: 'white', color: '#00a8b5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { background: 'transparent', color: '#64748b' }),
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                  ...(mode === 'signup'
                    ? { background: 'white', color: '#00a8b5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { background: 'transparent', color: '#64748b' }),
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error / Notice */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', marginBottom: '1rem' }}>
                ⚠ {error}
              </div>
            )}
            {notice && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '1rem' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px' }} />
                <span>{notice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                  <Mail className="w-4 h-4" style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@altitude.com"
                    style={{ background: 'transparent', fontSize: '0.875rem', color: '#0f172a', outline: 'none', width: '100%', fontWeight: 500 }}
                  />
                </div>
                {mode === 'signup' && (
                  <div style={{ marginTop: '6px', fontSize: '0.68rem', fontWeight: 500, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck className="w-3 h-3" />
                    Only @altitude.com emails are accepted for workspace access
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                  <Lock className="w-4 h-4" style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ background: 'transparent', fontSize: '0.875rem', color: '#0f172a', outline: 'none', width: '100%', fontWeight: 500 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim() || !password}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#00a8b5',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting || !email.trim() || !password ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || !email.trim() || !password ? 0.5 : 1,
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0,168,181,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signin' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? mode === 'signin' ? 'Signing in...' : 'Creating account...'
                    : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </span>
                {!isSubmitting && <ChevronRight className="w-4 h-4" style={{ opacity: 0.6 }} />}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.5rem', fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Your data is private — only you can access your workspace.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column !important;
            max-width: 420px !important;
            margin: 0 auto;
          }
          .brand-panel {
            width: 100% !important;
            padding: 2rem 1.5rem !important;
          }
          .form-panel {
            width: 100% !important;
            padding: 2rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
