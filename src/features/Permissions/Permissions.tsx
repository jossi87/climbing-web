import { useState } from 'react';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { usePermissions } from '../../api';
import { ClickableAvatar } from '../../shared/ui/Avatar/Avatar';
import { useMeta } from '../../shared/components/Meta/context';
import { Link } from 'react-router-dom';
import { Users, Search, Shield, ShieldAlert, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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

  const filteredData = data.filter((item) => !query || (item.name ?? '').toLowerCase().includes(query.toLowerCase()));

  if (loading) {
    return <Loading />;
  }

  const handlePermissionChange = (userId: number, value: number) => {
    const adminRead = value === 1 || value === 2;
    const adminWrite = value === 2;
    const superadminRead = value === 3;
    const superadminWrite = value === 3;

    postPermissions(userId, adminRead, adminWrite, superadminRead, superadminWrite).catch((error) => {
      console.error(error);
      alert(error.toString());
    });
  };

  return (
    <div className='max-w-container mx-auto space-y-8 px-4 py-6'>
      <title>{`Permissions | ${meta?.title}`}</title>

      <div className='border-surface-border flex flex-col justify-between gap-6 border-b pb-6 md:flex-row md:items-end'>
        <div className='space-y-1'>
          <div className='text-brand flex items-center gap-3'>
            <Users size={24} />
            <h1 className='type-h1'>Permissions</h1>
          </div>
          <p className={designContract.typography.label}>
            {query ? `${filteredData.length}/${data.length} users` : `${data.length} users Total`}
          </p>
        </div>

        <div className='relative w-full md:w-72'>
          <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={16} />
          <input
            type='text'
            placeholder='Search users...'
            className='bg-surface-nav border-surface-border focus:border-brand/50 type-small w-full rounded-xl border py-2.5 pr-4 pl-10 transition-colors placeholder:text-slate-600 focus:outline-none'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className='bg-surface-card border-surface-border rounded-2xl border border-dashed py-20 text-center'>
          <p className={designContract.typography.label}>No users found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredData.map((u) => {
            const currentLevel = u.superadminWrite ? 3 : u.adminWrite ? 2 : u.adminRead ? 1 : 0;
            const config = ROLE_CONFIG[currentLevel];
            const Icon = config.icon;

            return (
              <div
                key={u.userId}
                className={cn(
                  'group relative flex flex-col rounded-2xl border p-5 transition-all duration-300',
                  config.color,
                )}
              >
                <div className='mb-4 flex items-start justify-between'>
                  <ClickableAvatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='small'
                  />
                  <div className={cn('rounded-lg p-2', config.badge)}>
                    <Icon size={18} />
                  </div>
                </div>

                <div className='mb-6 space-y-1'>
                  <Link to={`/user/${u.userId}`} className='type-h2 hover:text-brand block truncate transition-colors'>
                    {u.name}
                  </Link>
                  <p className={designContract.typography.label}>Last seen {u.lastLogin}</p>
                </div>

                <div className='relative mt-auto'>
                  <select
                    disabled={u.readOnly}
                    value={currentLevel}
                    onChange={(e) => handlePermissionChange(u.userId ?? 0, Number(e.target.value))}
                    className='bg-surface-dark/50 border-surface-border focus:border-brand/50 w-full cursor-pointer appearance-none rounded-lg border px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none disabled:opacity-50'
                  >
                    {ROLE_CONFIG.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-600'
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
