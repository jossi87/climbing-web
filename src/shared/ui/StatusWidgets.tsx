import { useAuth0 } from '@auth0/auth0-react';
import { Lock, LogIn, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';

type LoadingProps = {
  inline?: boolean;
};

const LoadingContent = () => (
  <div className='flex min-h-[160px] w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 sm:min-h-[220px]'>
    <div className='bg-surface-raised border-surface-border ring-brand-border/35 rounded-full border p-3 ring-1'>
      <RefreshCw className='h-7 w-7 animate-spin text-slate-100' strokeWidth={2.25} aria-hidden />
    </div>
    <div className='text-center'>
      <h3 className='text-sm font-medium tracking-tight text-slate-100'>Loading</h3>
      <p className='type-small mt-1 text-slate-500'>Fetching data…</p>
    </div>
  </div>
);

export const Loading = ({ inline = false }: LoadingProps) =>
  inline ? (
    <LoadingContent />
  ) : (
    <Card flush className='overflow-hidden border-0 text-left'>
      <LoadingContent />
    </Card>
  );

export const NotLoggedIn = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className='bg-surface-card border-surface-border rounded-xl border p-6 shadow-2xl'>
      <div className='mb-6 flex items-center gap-5 text-left'>
        <div className='border-surface-border bg-surface-raised rounded-2xl border p-4 text-slate-400 shadow-inner'>
          <Lock size={24} />
        </div>
        <div>
          <h3 className='text-lg leading-tight font-semibold text-slate-200'>Authentication required</h3>
          <p className='mt-1 text-sm text-slate-500'>You must be logged in to access this page</p>
        </div>
      </div>
      <button
        onClick={() =>
          loginWithRedirect({
            appState: {
              returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}`,
            },
          })
        }
        className='type-body btn-brand-solid flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 font-semibold shadow-lg transition-all active:scale-95'
      >
        <LogIn size={18} /> Sign in
      </button>
    </div>
  );
};

export const InsufficientPrivileges = () => (
  <div className='bg-surface-card border-surface-border rounded-xl border p-6 text-left shadow-2xl'>
    <div className='mb-5 flex items-center gap-5'>
      <div className='border-surface-border bg-surface-raised rounded-2xl border border-red-500/30 p-4 text-red-400 shadow-inner'>
        <AlertTriangle size={24} />
      </div>
      <div>
        <h3 className='text-lg leading-tight font-semibold text-slate-200'>Insufficient privileges</h3>
        <p className='mt-1 text-sm text-slate-500'>You don't have access to this page</p>
      </div>
    </div>
    <div className='bg-surface-raised border-surface-border/50 rounded-lg border p-4'>
      <p className='text-sm leading-relaxed text-slate-400'>
        Contact{' '}
        <a
          href='mailto:jostein.oygarden@gmail.com'
          className='decoration-brand/30 hover:text-brand active:text-brand focus-visible:text-brand focus-visible:ring-brand-border/55 focus-visible:ring-offset-surface-raised font-semibold text-slate-200 underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          Jostein Øygarden
        </a>{' '}
        if you need an upgrade.
      </p>
    </div>
  </div>
);
