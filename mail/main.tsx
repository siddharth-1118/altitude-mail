import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, Video, HardDrive, FileText, Zap, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/src/lib/auth';
import { AuthScreen } from '@/src/components/AuthScreen';
import { MailApp } from '@/src/components/mail/MailApp';
import '@/src/index.css';

// Standalone altitude Mail app — served by the mail server (e.g. :3001).
function MailShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7fb] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00a8b5] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        title="altitude Mail"
        subtitle="Sign in to access your workspace mailbox, AI summaries, and action center."
      />
    );
  }

  const navLinks = [
    { label: 'Meet', icon: <Video className="w-3.5 h-3.5" />, url: 'http://localhost:3000', color: '#00e5f2' },
    { label: 'Drive', icon: <HardDrive className="w-3.5 h-3.5" />, url: 'http://localhost:3002', color: '#00e5f2' },
    { label: 'Forms', icon: <FileText className="w-3.5 h-3.5" />, url: 'http://localhost:3003', color: '#00e5f2' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f7fb] text-slate-800 antialiased font-sans">
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, #0c1a2a, #0f2638)', padding: '0 16px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #00a8b5, #008894)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>altitude</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px', marginLeft: '2px' }}>
            <Mail className="w-3 h-3 inline mr-1" />Mail
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.2s', background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = link.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
          <div style={{ marginLeft: '8px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
            {user.email}
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <MailApp />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MailShell />
    </AuthProvider>
  </StrictMode>
);
