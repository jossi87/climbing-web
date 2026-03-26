import { useEffect, useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { usePermissions } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { Users, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SearchInput, UserCard } from '../../shared/ui';

const ROLE_CONFIG = [
  {
    value: 0,
    label: 'Default user',
  },
  {
    value: 1,
    label: 'Read hidden',
  },
  {
    value: 2,
    label: 'Admin (Write)',
  },
  {
    value: 3,
    label: 'Superadmin',
  },
] as const;

const Permissions = () => {
  const meta = useMeta();
  const [query, setQuery] = useState<string>('');
  const [openRoleMenuUserId, setOpenRoleMenuUserId] = useState<number | null>(null);
  const { data = [], isLoading: loading, update: postPermissions } = usePermissions();

  const filteredData = data.filter((item) => !query || (item.name ?? '').toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('[data-role-menu]')) {
        setOpenRoleMenuUserId(null);
      }
    };
    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

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

  const getLevel = (u: (typeof data)[number]) => (u.superadminWrite ? 3 : u.adminWrite ? 2 : u.adminRead ? 1 : 0);

  const groups = [
    { value: 3, title: 'Superadmin' },
    { value: 2, title: 'Admin' },
    { value: 1, title: 'Read hidden' },
    { value: 0, title: 'Default users' },
  ]
    .map((group) => ({
      ...group,
      users: filteredData.filter((u) => getLevel(u) === group.value),
    }))
    .filter((group) => group.users.length > 0);

  return (
    <div className='w-full min-w-0'>
      <title>{`Permissions | ${meta?.title}`}</title>
      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='border-surface-border border-b p-4 sm:p-5'>
          <div className='flex min-w-0 flex-nowrap items-center justify-between gap-3'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2.5'>
                <Users size={18} className='text-brand/80' />
                <h1 className='type-h1 leading-none'>Permissions</h1>
              </div>
              <p className={cn(designContract.typography.label, 'mt-1')}>
                {query ? `${filteredData.length}/${data.length} users` : `${data.length} users total`}
              </p>
            </div>
            <div className='ml-auto w-44 max-w-[48vw] shrink-0 sm:w-64'>
              <SearchInput
                type='text'
                placeholder='Search users...'
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                className='bg-surface-nav/35 border-white/5 placeholder:text-slate-500/80 focus:border-white/10'
              />
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className='px-4 py-16 text-center sm:px-5 sm:py-20'>
            <p className={designContract.typography.label}>No users found</p>
          </div>
        ) : (
          <div className='divide-surface-border/25 divide-y'>
            {groups.map((group) => (
              <section key={group.value} className='py-2'>
                <div className='px-3 pb-2 sm:px-5'>
                  <span className={cn(designContract.typography.label, 'text-slate-500')}>{group.title}</span>
                </div>
                <div className='bg-surface-card grid grid-cols-2 gap-px lg:grid-cols-3 xl:grid-cols-4'>
                  {group.users.map((u) => {
                    const currentLevel = getLevel(u);

                    return (
                      <div key={u.userId} className='bg-surface-card min-w-0 px-2.5 py-2.5 sm:px-3 sm:py-3'>
                        <UserCard
                          variant='minimal'
                          user={{
                            userId: u.userId,
                            name: u.name,
                            mediaId: u.mediaId,
                            mediaVersionStamp: u.mediaVersionStamp,
                            lastLogin: u.lastLogin,
                          }}
                          metaAction={
                            <div className='relative min-w-0' data-role-menu>
                              <button
                                type='button'
                                disabled={u.readOnly}
                                onClick={() =>
                                  setOpenRoleMenuUserId((prev) => (prev === (u.userId ?? -1) ? null : (u.userId ?? -1)))
                                }
                                className='bg-surface-nav/65 hover:bg-surface-nav/75 inline-flex w-full min-w-0 items-center justify-between rounded-md border border-white/10 px-2 py-1 text-left text-[10px] font-semibold text-slate-100 transition-colors hover:border-white/20 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]'
                              >
                                <span className='truncate'>{ROLE_CONFIG[currentLevel]?.label ?? 'Default user'}</span>
                                <ChevronDown size={12} className='ml-2 shrink-0 text-slate-500' />
                              </button>
                              {openRoleMenuUserId === (u.userId ?? -1) && (
                                <div className='bg-surface-card border-surface-border absolute z-20 mt-1 w-full overflow-hidden rounded-md border shadow-xl'>
                                  {ROLE_CONFIG.map((opt) => (
                                    <button
                                      key={opt.value}
                                      type='button'
                                      onClick={() => {
                                        handlePermissionChange(u.userId ?? 0, opt.value);
                                        setOpenRoleMenuUserId(null);
                                      }}
                                      className={cn(
                                        'w-full px-2 py-1.5 text-left text-[10px] font-semibold transition-colors sm:text-[11px]',
                                        opt.value === currentLevel
                                          ? 'bg-surface-hover text-slate-100'
                                          : 'hover:bg-surface-hover/60 text-slate-300',
                                      )}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Permissions;
