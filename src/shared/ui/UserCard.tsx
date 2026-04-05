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
      'group flex items-center gap-3 transition-all duration-300 sm:gap-4',
      variant === 'minimal'
        ? 'hover:bg-surface-raised-hover rounded-lg px-1.5 py-2'
        : 'border-surface-border/50 hover:bg-surface-raised-hover hover:border-brand/40 rounded-xl border p-3 sm:p-4',
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
            'hover:text-brand mt-1 flex min-w-0 items-center gap-2 transition-colors',
            designContract.typography.micro,
            'normal-case',
            variant === 'minimal' ? 'text-slate-300 hover:text-slate-100' : 'text-slate-400 hover:text-slate-100',
          )}
        >
          <Mail size={12} className={cn('shrink-0', variant === 'minimal' ? 'text-slate-400' : 'text-slate-600')} />
          <span className='min-w-0 truncate'>{user.emails[0]}</span>
        </a>
      )}
    </div>
  </div>
);
