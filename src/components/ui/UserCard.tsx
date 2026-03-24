import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import { ClickableAvatar } from './Avatar/Avatar';
import type { Success } from '../../@types/buldreinfo';

type Administrator = Success<'getAdministrators'>[number];

export const UserCard = ({ user }: { user: Administrator }) => (
  <div className='flex items-center gap-4 p-4 rounded-xl border border-surface-border/50 group hover:border-brand/40 hover:bg-white/2 transition-all duration-300'>
    <ClickableAvatar
      name={user.name}
      mediaId={user.mediaId ?? undefined}
      mediaVersionStamp={user.mediaVersionStamp ?? undefined}
      size='small'
    />
    <div className='min-w-0 flex-1 flex flex-col'>
      <Link
        to={`/user/${user.userId}`}
        className='text-slate-100 font-bold hover:text-brand transition-colors text-sm truncate'
      >
        {user.name}
      </Link>
      <div className='flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5'>
        <Calendar size={10} className='text-slate-600' />
        <span>Seen {user.lastLogin}</span>
      </div>
      {user.emails?.[0] && (
        <a
          href={`mailto:${user.emails[0]}`}
          className='mt-2 flex items-center gap-2 text-[11px] text-slate-400 hover:text-brand transition-colors truncate'
        >
          <Mail size={12} className='text-slate-600 shrink-0' />
          {user.emails[0]}
        </a>
      )}
    </div>
  </div>
);
