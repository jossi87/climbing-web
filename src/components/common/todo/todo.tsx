import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Loading, LockSymbol } from '../widgets/widgets';
import { useTodo } from '../../../api';
import { Bookmark } from 'lucide-react';

const Todo = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const { data } = useTodo({ idArea, idSector });

  if (!data) {
    return <Loading />;
  }

  if ((data.sectors ?? []).length === 0) {
    return (
      <div className='p-8 text-center text-slate-500 italic bg-surface-nav/20 rounded-xl border border-surface-border'>
        Empty list.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-1 border-b border-surface-border pb-4'>
        <div className='flex items-center gap-2 text-white'>
          <Bookmark size={18} className='text-brand' />
          <h4 className='text-lg font-black uppercase tracking-tight'>Todo</h4>
        </div>
        <p className='text-xs text-slate-500'>Find other users with projects in the same area.</p>
      </div>

      <div className='space-y-8'>
        {(data.sectors ?? []).map((sector) => (
          <div key={sector.id} className='space-y-3'>
            {idArea > 0 && (
              <div className='flex items-center gap-2 py-1 px-3 bg-surface-nav/40 border-l-2 border-brand/50 rounded-r-md'>
                <Link
                  to={`/sector/${sector.id}`}
                  className='text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors'
                >
                  {sector.name}
                </Link>
                <LockSymbol
                  lockedAdmin={sector.lockedAdmin}
                  lockedSuperadmin={sector.lockedSuperadmin}
                />
              </div>
            )}

            <div className='flex flex-col gap-1 ml-1'>
              {(sector.problems ?? []).map((problem) => (
                <div
                  key={problem.id}
                  className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group'
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='text-[10px] font-mono text-slate-500 w-6 shrink-0'>
                      #{problem.nr}
                    </span>
                    <Link
                      to={`/problem/${problem.id}`}
                      className='text-[14px] font-bold text-slate-200 hover:text-brand transition-colors truncate'
                    >
                      {problem.name}
                    </Link>
                    <span className='text-[12px] font-mono text-slate-400'>[{problem.grade}]</span>
                    <LockSymbol
                      lockedAdmin={problem.lockedAdmin}
                      lockedSuperadmin={problem.lockedSuperadmin}
                    />
                  </div>

                  {problem.partners && problem.partners.length > 0 && (
                    <div className='flex items-center gap-1 text-[11px] text-slate-500 pl-8 sm:pl-0'>
                      <span className='font-medium'>Users:</span>
                      <div className='flex flex-wrap gap-x-1.5'>
                        {problem.partners.map((u, i) => (
                          <Fragment key={u.id}>
                            <Link
                              to={`/user/${u.id}/todo`}
                              className='text-slate-400 hover:text-brand transition-colors'
                            >
                              {u.name}
                            </Link>
                            {i < (problem.partners?.length ?? 0) - 1 && (
                              <span className='opacity-30'>•</span>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Todo;
