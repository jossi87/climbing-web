import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import { ClickableAvatar } from './Avatar/Avatar';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';
import type { Success } from '../../@types/buldreinfo';

type Administrator = Success<'getAdministrators'>[number];

type UserCardProps = {
  user: Administrator;
  variant?: 'default' | 'minimal';
  metaAction?: ReactNode;
};

export const UserCard = ({ user, variant = 'default', metaAction }: UserCardProps) => (
  <div
    className={cn(
      'flex items-center gap-3 transition-all duration-300 sm:gap-4',
      variant === 'minimal'
        ? 'hover:bg-surface-raised-hover rounded-lg px-1.5 py-2'
        : 'border-surface-border/50 hover:bg-surface-raised-hover hover:border-brand-border rounded-xl border p-3 sm:p-4',
    )}
  >
    <ClickableAvatar
      name={user.name}
      mediaId={user.mediaId ?? undefined}
      mediaVersionStamp={user.mediaVersionStamp ?? undefined}
      size={variant === 'minimal' ? 'tiny' : 'small'}
    />
    <div className='flex min-w-0 flex-1 flex-col'>
      <Link
        to={`/user/${user.userId}`}
        className='hover:text-brand truncate text-sm font-semibold text-slate-100 transition-colors'
      >
        {user.name}
      </Link>
      <div
        className={cn(
          'mt-0.5 flex items-center gap-1.5',
          designContract.typography.micro,
          'normal-case',
          variant === 'minimal' ? 'text-slate-400 opacity-95' : 'text-slate-500 opacity-70',
        )}
      >
        <Calendar size={10} className={cn(variant === 'minimal' ? 'text-slate-400' : 'text-slate-500 opacity-90')} />
        <span>Seen {user.lastLogin}</span>
      </div>
      {metaAction ? <div className='mt-1 min-w-0'>{metaAction}</div> : null}
      {user.emails?.[0] && (
        <a
          href={`mailto:${user.emails[0]}`}
          className={cn(
            'group/mail hover:text-brand active:text-brand focus-visible:text-brand focus-visible:ring-brand-border/55 focus-visible:ring-offset-surface-card mt-1 flex min-w-0 items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            designContract.typography.micro,
            'normal-case',
            variant === 'minimal' ? 'text-slate-300' : 'text-slate-400',
          )}
        >
          <Mail
            size={12}
            className={cn(
              'group-hover/mail:text-brand shrink-0 transition-colors',
              variant === 'minimal' ? 'text-slate-400' : 'text-slate-500',
            )}
          />
          <span className='min-w-0 truncate'>{user.emails[0]}</span>
        </a>
      )}
    </div>
  </div>
);
