import { useAuth0 } from '@auth0/auth0-react';
import { Lock, LogIn, AlertTriangle, RefreshCw } from 'lucide-react';

export const Loading = () => (
  <div className='flex flex-col items-center justify-center min-h-100 w-full animate-in fade-in duration-500 bg-surface-dark/20 rounded-xl border border-surface-border/50'>
    <div className='relative'>
      <RefreshCw className='w-10 h-10 text-brand animate-spin' />
    </div>
    <div className='mt-6 text-center'>
      <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
        Fetching Data
      </h3>
      <p className='text-[10px] text-slate-600 mt-1 italic font-medium'>Just a moment...</p>
    </div>
  </div>
);

export const NotLoggedIn = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className='p-6 bg-surface-card border border-surface-border rounded-xl shadow-2xl'>
      <div className='flex items-center gap-5 mb-6 text-left'>
        <div className='p-4 rounded-2xl bg-surface-nav border border-surface-border text-slate-400 shadow-inner'>
          <Lock size={24} />
        </div>
        <div>
          <h3 className='text-slate-200 font-bold text-lg leading-tight'>
            Authentication required
          </h3>
          <p className='text-slate-500 text-sm mt-1'>You must be logged in to access this page</p>
        </div>
      </div>
      <button
        onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
        className='w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95'
      >
        <LogIn size={18} /> Sign in
      </button>
    </div>
  );
};

export const InsufficientPrivileges = () => (
  <div className='p-6 bg-surface-card border border-surface-border rounded-xl text-left shadow-2xl'>
    <div className='flex items-center gap-5 mb-5'>
      <div className='p-4 rounded-2xl bg-red-500/10 text-red-500 shadow-inner border border-red-500/20'>
        <AlertTriangle size={24} />
      </div>
      <div>
        <h3 className='text-slate-200 font-bold text-lg leading-tight'>Insufficient privileges</h3>
        <p className='text-slate-500 text-sm mt-1'>You don't have access to this page</p>
      </div>
    </div>
    <div className='p-4 bg-surface-nav/50 rounded-lg border border-surface-border/50'>
      <p className='text-slate-400 text-sm leading-relaxed'>
        Contact{' '}
        <a
          href='mailto:jostein.oygarden@gmail.com'
          className='text-slate-200 hover:text-brand transition-colors font-bold underline decoration-brand/30 underline-offset-4'
        >
          Jostein Øygarden
        </a>{' '}
        if you need an upgrade.
      </p>
    </div>
  </div>
);
