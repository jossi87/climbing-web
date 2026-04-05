import { useAuth0 } from '@auth0/auth0-react';
import { Lock, LogIn, AlertTriangle, RefreshCw } from 'lucide-react';
import { designContract } from '../../design/contract';
import { Card } from './Card';

type LoadingProps = {
  inline?: boolean;
};

const LoadingContent = () => (
  <div className='flex min-h-[160px] w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 sm:min-h-[220px]'>
    <div className='bg-surface-nav border-surface-border/60 rounded-full border p-3'>
      <RefreshCw className='text-brand h-7 w-7 animate-spin' />
    </div>
    <div className='text-center'>
      <h3 className={designContract.typography.label}>Loading</h3>
      <p className='type-small mt-1 opacity-70'>Fetching data...</p>
    </div>
  </div>
);

export const Loading = ({ inline = false }: LoadingProps) =>
  inline ? (
    <LoadingContent />
  ) : (
    <Card flush className='overflow-hidden border-0 text-left sm:border'>
      <LoadingContent />
    </Card>
  );

export const NotLoggedIn = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <div className='bg-surface-card border-surface-border rounded-xl border p-6 shadow-2xl'>
      <div className='mb-6 flex items-center gap-5 text-left'>
        <div className='bg-surface-nav border-surface-border rounded-2xl border p-4 text-slate-400 shadow-inner'>
          <Lock size={24} />
        </div>
        <div>
          <h3 className='text-lg leading-tight font-semibold text-slate-200'>Authentication required</h3>
          <p className='mt-1 text-sm text-slate-500'>You must be logged in to access this page</p>
        </div>
      </div>
      <button
        onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
        className='bg-brand hover:bg-brand/90 type-body flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 font-semibold shadow-lg transition-all active:scale-95'
      >
        <LogIn size={18} /> Sign in
      </button>
    </div>
  );
};

export const InsufficientPrivileges = () => (
  <div className='bg-surface-card border-surface-border rounded-xl border p-6 text-left shadow-2xl'>
    <div className='mb-5 flex items-center gap-5'>
      <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500 shadow-inner'>
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
          className='hover:text-brand decoration-brand/30 font-semibold text-slate-200 underline underline-offset-4 transition-colors'
        >
          Jostein Øygarden
        </a>{' '}
        if you need an upgrade.
      </p>
    </div>
  </div>
);
