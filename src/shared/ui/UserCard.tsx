import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import { ClickableAvatar } from './Avatar/Avatar';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';
import type { Success } from '../../@types/buldreinfo';

type Administrator = Success<'getAdministrators'>[number];

export const UserCard = ({ user }: { user: Administrator }) => (
  <div className='border-surface-border/50 group hover:border-brand/40 flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 hover:bg-white/2 sm:gap-4 sm:p-4'>
    <ClickableAvatar
      name={user.name}
      mediaId={user.mediaId ?? undefined}
      mediaVersionStamp={user.mediaVersionStamp ?? undefined}
      size='small'
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
          designContract.typography.label,
          'text-[10px] tracking-tight text-slate-500 normal-case opacity-70',
        )}
      >
        <Calendar size={10} className='text-slate-500 opacity-90' />
        <span>Seen {user.lastLogin}</span>
      </div>
      {user.emails?.[0] && (
        <a
          href={`mailto:${user.emails[0]}`}
          className='hover:text-brand mt-2 flex items-center gap-2 truncate text-[11px] text-slate-400 transition-colors'
        >
          <Mail size={12} className='shrink-0 text-slate-600' />
          {user.emails[0]}
        </a>
      )}
    </div>
  </div>
);
