import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Loading, LockSymbol } from '../Widgets/Widgets';
import { useTodo } from '../../../api';
import { Bookmark } from 'lucide-react';

const Todo = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const { data } = useTodo({ idArea, idSector });

  if (!data) {
    return <Loading />;
  }

  if ((data.sectors ?? []).length === 0) {
    return (
      <div className='bg-surface-nav/20 border-surface-border rounded-xl border p-8 text-center text-slate-500 italic'>
        Empty list.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='border-surface-border flex flex-col gap-1 border-b pb-4'>
        <div className='flex items-center gap-2'>
          <Bookmark size={18} className='text-brand' />
          <h4 className='type-h2'>Todo</h4>
        </div>
        <p className='text-xs text-slate-500'>Find other users with projects in the same area.</p>
      </div>

      <div className='space-y-8'>
        {(data.sectors ?? []).map((sector) => (
          <div key={sector.id} className='space-y-3'>
            {idArea > 0 && (
              <div className='bg-surface-nav/40 border-brand/50 flex items-center gap-2 rounded-r-md border-l-2 px-3 py-1'>
                <Link to={`/sector/${sector.id}`} className='type-label opacity-85 transition-colors hover:opacity-100'>
                  {sector.name}
                </Link>
                <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
              </div>
            )}

            <div className='ml-1 flex flex-col gap-1'>
              {(sector.problems ?? []).map((problem) => (
                <div
                  key={problem.id}
                  className='group flex flex-col justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/5 sm:flex-row sm:items-center'
                >
                  <div className='flex min-w-0 items-center gap-2'>
                    <span className='w-6 shrink-0 font-mono text-[10px] text-slate-500'>#{problem.nr}</span>
                    <Link
                      to={`/problem/${problem.id}`}
                      className='type-body hover:text-brand truncate font-semibold transition-colors'
                    >
                      {problem.name}
                    </Link>
                    <span className='font-mono text-[12px] text-slate-400'>[{problem.grade}]</span>
                    <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                  </div>

                  {problem.partners && problem.partners.length > 0 && (
                    <div className='flex items-center gap-1 pl-8 text-[11px] text-slate-500 sm:pl-0'>
                      <span className='font-medium'>Users:</span>
                      <div className='flex flex-wrap gap-x-1.5'>
                        {problem.partners.map((u, i) => (
                          <Fragment key={u.id}>
                            <Link
                              to={`/user/${u.id}/todo`}
                              className='hover:text-brand text-slate-400 transition-colors'
                            >
                              {u.name}
                            </Link>
                            {i < (problem.partners?.length ?? 0) - 1 && <span className='opacity-30'>•</span>}
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
