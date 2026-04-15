import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Lock, LogIn, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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

type AuthGateCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: 'default' | 'danger';
};

function AuthGateCard({ icon, title, description, actions, tone = 'default' }: AuthGateCardProps) {
  const iconWrapClass =
    tone === 'danger'
      ? 'border-surface-border bg-surface-raised text-status-danger rounded-xl border p-3 shadow-sm'
      : 'border-surface-border bg-surface-raised text-slate-300 rounded-xl border p-3 shadow-sm';

  return (
    <Card flush className='min-w-0 border-0'>
      <div className='flex min-w-0 flex-col gap-4 p-4 sm:gap-5 sm:p-5'>
        <div className='flex min-w-0 items-start gap-3.5 sm:gap-4'>
          <div className={iconWrapClass}>{icon}</div>
          <div className='min-w-0'>
            <h2 className={cn(designContract.typography.subtitle, 'text-slate-100')}>{title}</h2>
            <p className={cn(designContract.typography.body, 'mt-1 text-slate-400')}>{description}</p>
          </div>
        </div>
        {actions ? <div className='min-w-0'>{actions}</div> : null}
      </div>
    </Card>
  );
}

export const NotLoggedIn = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <AuthGateCard
      icon={<Lock size={18} aria-hidden />}
      title='Authentication required'
      description='You must be logged in to access this page.'
      actions={
        <button
          onClick={() =>
            loginWithRedirect({
              appState: {
                returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}`,
              },
            })
          }
          className={cn(
            designContract.controls.brandSolid,
            'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] sm:min-h-9 sm:w-auto sm:text-[13px]',
          )}
        >
          <LogIn size={15} aria-hidden />
          <span>Sign in</span>
        </button>
      }
    />
  );
};

export const InsufficientPrivileges = () => (
  <AuthGateCard
    icon={<AlertTriangle size={18} aria-hidden />}
    title='Insufficient privileges'
    description="You don't have access to this page."
    tone='danger'
    actions={
      <div className='bg-surface-raised border-surface-border/60 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3'>
        <p className={cn(designContract.typography.body, 'text-slate-400')}>
          Contact{' '}
          <a
            href='mailto:jostein.oygarden@gmail.com'
            className='decoration-brand/35 hover:text-brand active:text-brand focus-visible:text-brand focus-visible:ring-brand-border/55 font-semibold text-slate-200 underline underline-offset-4 transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none'
          >
            Jostein Oeygarden
          </a>{' '}
          if you need an upgrade.
        </p>
      </div>
    }
  />
);
