import { useEffect, useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { usePermissions } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { Users, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SearchInput, SectionHeader, UserCard } from '../../shared/ui';

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

  const subheader = query ? `${filteredData.length}/${data.length} users` : `${data.length} users total`;

  return (
    <div className='w-full min-w-0'>
      <title>{`Permissions | ${meta?.title}`}</title>
      <meta name='description' content='Manage user roles and access' />
      <Card flush className='min-w-0 overflow-visible border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <SectionHeader className='mb-0 min-w-0 lg:flex-1' title='Permissions' icon={Users} subheader={subheader} />
            <div className='w-full shrink-0 lg:w-64 lg:max-w-[48vw]'>
              <SearchInput
                type='text'
                placeholder='Search users...'
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                className='bg-surface-raised border-surface-border focus:border-surface-border placeholder:text-slate-500'
              />
            </div>
          </div>
        </div>

        <div className='border-surface-border/60 border-t'>
          {filteredData.length === 0 ? (
            <div className='px-4 py-16 text-center sm:px-5 sm:py-20'>
              <p className={designContract.typography.label}>No users found</p>
            </div>
          ) : (
            <div className='divide-surface-border/25 divide-y'>
              {groups.map((group) => (
                <section key={group.value} className='py-1.5'>
                  <div className='px-3 pb-1.5 sm:px-5'>
                    <span className={cn(designContract.typography.label, 'text-slate-500')}>{group.title}</span>
                  </div>
                  <div className='bg-surface-card grid grid-cols-2 gap-px lg:grid-cols-3 xl:grid-cols-4'>
                    {group.users.map((u) => {
                      const currentLevel = getLevel(u);

                      return (
                        <div key={u.userId} className='bg-surface-card min-w-0 px-2 py-2 sm:px-2.5 sm:py-2'>
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
                                    setOpenRoleMenuUserId((prev) =>
                                      prev === (u.userId ?? -1) ? null : (u.userId ?? -1),
                                    )
                                  }
                                  className='bg-surface-raised hover:bg-surface-raised-hover border-surface-border inline-flex w-full min-w-0 items-center justify-between rounded-md border px-2 py-1 text-left text-[11px] font-semibold text-slate-100 transition-colors hover:border-slate-500 focus:border-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[12px]'
                                >
                                  <span className='truncate'>{ROLE_CONFIG[currentLevel]?.label ?? 'Default user'}</span>
                                  <ChevronDown size={12} className='ml-2 shrink-0 text-slate-500' />
                                </button>
                                {openRoleMenuUserId === (u.userId ?? -1) && (
                                  <div className='bg-surface-card border-surface-border absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-xl'>
                                    {ROLE_CONFIG.map((opt) => (
                                      <button
                                        key={opt.value}
                                        type='button'
                                        onClick={() => {
                                          handlePermissionChange(u.userId ?? 0, opt.value);
                                          setOpenRoleMenuUserId(null);
                                        }}
                                        className={cn(
                                          'w-full px-2 py-1.5 text-left text-[11px] font-semibold transition-colors sm:text-[12px]',
                                          opt.value === currentLevel
                                            ? 'bg-surface-hover text-slate-100'
                                            : 'hover:bg-surface-hover text-slate-300',
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
        </div>
      </Card>
    </div>
  );
};

export default Permissions;
