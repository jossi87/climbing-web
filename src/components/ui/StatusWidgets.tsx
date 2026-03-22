import { useAuth0 } from '@auth0/auth0-react';
import { Lock, LogIn, AlertTriangle } from 'lucide-react';

export const Loading = () => (
  <div className='flex flex-col items-center justify-center min-h-100 w-full animate-in fade-in duration-500'>
    <div className='relative'>
      <div className='w-12 h-12 rounded-full border-4 border-surface-border border-t-brand animate-spin' />
    </div>
    <div className='mt-6 text-center'>
      <h3 className='text-sm font-bold text-slate-300 uppercase tracking-widest'>Fetching Data</h3>
      <p className='text-xs text-slate-500 mt-1 italic'>Just a moment...</p>
    </div>
  </div>
);

export const NotLoggedIn = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className='p-6 bg-surface-card border border-surface-border rounded-md'>
      <div className='flex items-center gap-4 mb-6 text-left'>
        <div className='p-3 rounded-xl bg-surface-nav border border-surface-border text-slate-400 shadow-inner'>
          <Lock size={24} />
        </div>
        <div>
          <h3 className='text-slate-200 font-bold'>Authentication required</h3>
          <p className='text-slate-500 text-sm'>You must be logged in to access this page</p>
        </div>
      </div>
      <button
        onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
        className='flex items-center gap-2 px-4 py-2 bg-surface-nav border border-surface-border hover:bg-brand hover:border-brand hover:text-white text-slate-300 rounded-md font-bold text-sm transition-all'
      >
        <LogIn size={18} /> Sign in
      </button>
    </div>
  );
};

export const InsufficientPrivileges = () => (
  <div className='p-6 bg-surface-card border border-surface-border rounded-md text-left'>
    <div className='flex items-center gap-4 mb-4'>
      <div className='p-3 rounded-xl bg-red-500/10 text-red-500 shadow-inner'>
        <AlertTriangle size={24} />
      </div>
      <div>
        <h3 className='text-slate-200 font-bold'>Insufficient privileges</h3>
        <p className='text-slate-500 text-sm'>You don't have access to this page</p>
      </div>
    </div>
    <p className='text-slate-400 text-sm'>
      Contact{' '}
      <a
        href='mailto:jostein.oygarden@gmail.com'
        className='text-slate-200 hover:text-brand transition-colors font-bold'
      >
        Jostein Øygarden
      </a>{' '}
      if you want access.
    </p>
  </div>
);
