import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import { ClickableAvatar } from './Avatar/Avatar';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

/** Administrators use `randomMedia`; permissions rows use `mediaIdentity`. */
type UserCardUser = {
  userId?: number;
  name?: string;
  emails?: string[];
  lastLogin?: string;
  mediaIdentity?: components['schemas']['MediaIdentity'];
  randomMedia?: components['schemas']['MediaIdentity'];
};

type UserCardProps = {
  user: UserCardUser;
  variant?: 'default' | 'minimal';
  metaAction?: ReactNode;
};

export const UserCard = ({ user, variant = 'default', metaAction }: UserCardProps) => (
  <div
    className={cn(
      'flex items-center transition-all duration-300',
      variant === 'minimal' ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-4',
      variant === 'minimal'
        ? 'hover:bg-surface-raised-hover rounded-lg px-1.5 py-1.5'
        : 'border-surface-border/50 hover:bg-surface-raised-hover hover:border-brand-border rounded-xl border p-3 sm:p-4',
    )}
  >
    <ClickableAvatar
      name={user.name}
      mediaIdentity={user.mediaIdentity ?? user.randomMedia}
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
          'mt-0.5 flex items-center gap-1.5 normal-case',
          variant === 'minimal'
            ? 'light:text-slate-600 text-[10px] leading-snug font-normal text-slate-500 sm:text-[11px]'
            : cn(designContract.typography.micro, 'text-slate-500 opacity-70'),
        )}
      >
        <Calendar
          size={variant === 'minimal' ? 9 : 10}
          className={cn(
            'shrink-0',
            variant === 'minimal' ? 'light:text-slate-600 text-slate-500' : 'text-slate-500 opacity-90',
          )}
        />
        <span>Seen {user.lastLogin}</span>
      </div>
      {metaAction ? <div className='mt-1 min-w-0'>{metaAction}</div> : null}
      {user.emails?.[0] && (
        <a
          href={`mailto:${user.emails[0]}`}
          className={cn(
            'group/mail focus-visible:ring-offset-surface-card mt-1 flex min-w-0 items-center gap-1.5 normal-case transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            variant === 'minimal'
              ? cn(
                  'light:text-slate-600 text-[10px] leading-snug font-normal text-slate-500 hover:text-slate-300 focus-visible:ring-slate-400/35 sm:text-[11px]',
                  twInk.lightHoverSlate800,
                )
              : cn(
                  'hover:text-brand active:text-brand focus-visible:text-brand focus-visible:ring-brand-border/55',
                  designContract.typography.micro,
                  'text-slate-400',
                ),
          )}
        >
          <Mail
            size={variant === 'minimal' ? 9 : 12}
            className={cn(
              'shrink-0 transition-colors',
              variant === 'minimal'
                ? 'light:text-slate-600 light:group-hover/mail:text-slate-600 text-slate-500 group-hover/mail:text-slate-400'
                : 'group-hover/mail:text-brand text-slate-500',
            )}
          />
          <span className='min-w-0 truncate'>{user.emails[0]}</span>
        </a>
      )}
    </div>
  </div>
);
