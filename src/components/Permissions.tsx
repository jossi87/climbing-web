import { useState } from 'react';
import { Loading } from './common/widgets/widgets';
import { usePermissions } from '../api';
import { ClickableAvatar } from './ui/Avatar';
import { useMeta } from './common/meta/context';
import { Link } from 'react-router-dom';
import { Users, Search, Shield, ShieldAlert, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const ROLE_CONFIG = [
  {
    value: 0,
    label: 'Default user',
    icon: User,
    color: 'border-slate-800 bg-slate-900/50',
    badge: 'text-slate-500 bg-slate-500/10',
  },
  {
    value: 1,
    label: 'Read hidden',
    icon: Shield,
    color: 'border-blue-500/30 bg-blue-500/5',
    badge: 'text-blue-400 bg-blue-400/10',
  },
  {
    value: 2,
    label: 'Admin (Write)',
    icon: ShieldCheck,
    color: 'border-emerald-500/30 bg-emerald-500/5',
    badge: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    value: 3,
    label: 'Superadmin',
    icon: ShieldAlert,
    color: 'border-rose-500/30 bg-rose-500/5',
    badge: 'text-rose-400 bg-rose-400/10',
  },
] as const;

const Permissions = () => {
  const meta = useMeta();
  const [query, setQuery] = useState<string>('');
  const { data = [], isLoading: loading, update: postPermissions } = usePermissions();

  const filteredData = data.filter(
    (item) => !query || (item.name ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) {
    return <Loading />;
  }

  const handlePermissionChange = (userId: number, value: number) => {
    const adminRead = value === 1 || value === 2;
    const adminWrite = value === 2;
    const superadminRead = value === 3;
    const superadminWrite = value === 3;

    postPermissions(userId, adminRead, adminWrite, superadminRead, superadminWrite).catch(
      (error) => {
        console.error(error);
        alert(error.toString());
      },
    );
  };

  return (
    <div className='max-w-container mx-auto px-4 py-8 space-y-8'>
      <title>{`Permissions | ${meta?.title}`}</title>

      {/* Header & Search */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-border'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3 text-brand'>
            <Users size={24} />
            <h1 className='text-2xl font-black uppercase tracking-tight text-white'>Permissions</h1>
          </div>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
            {query ? `${filteredData.length}/${data.length} users` : `${data.length} users Total`}
          </p>
        </div>

        <div className='relative w-full md:w-72'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' size={16} />
          <input
            type='text'
            placeholder='Search users...'
            className='w-full bg-surface-nav border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand/50 transition-colors'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      </div>

      {/* User Grid */}
      {filteredData.length === 0 ? (
        <div className='py-20 text-center bg-surface-card border border-dashed border-surface-border rounded-2xl'>
          <p className='text-slate-500 font-bold uppercase tracking-widest text-sm'>
            No users found
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {filteredData.map((u) => {
            const currentLevel = u.superadminWrite ? 3 : u.adminWrite ? 2 : u.adminRead ? 1 : 0;
            const config = ROLE_CONFIG[currentLevel];
            const Icon = config.icon;

            return (
              <div
                key={u.userId}
                className={cn(
                  'flex flex-col p-5 rounded-2xl border transition-all duration-300 relative group',
                  config.color,
                )}
              >
                <div className='flex items-start justify-between mb-4'>
                  <ClickableAvatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='small'
                  />
                  <div className={cn('p-2 rounded-lg', config.badge)}>
                    <Icon size={18} />
                  </div>
                </div>

                <div className='space-y-1 mb-6'>
                  <Link
                    to={`/user/${u.userId}`}
                    className='text-white font-black hover:text-brand transition-colors block truncate'
                  >
                    {u.name}
                  </Link>
                  <p className='text-[10px] text-slate-500 font-bold uppercase tracking-tighter'>
                    Last seen {u.lastLogin}
                  </p>
                </div>

                <div className='mt-auto relative'>
                  <select
                    disabled={u.readOnly}
                    value={currentLevel}
                    onChange={(e) => handlePermissionChange(u.userId ?? 0, Number(e.target.value))}
                    className='w-full appearance-none bg-surface-dark/50 border border-surface-border rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand/50 disabled:opacity-50 cursor-pointer'
                  >
                    {ROLE_CONFIG.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none'
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Permissions;
