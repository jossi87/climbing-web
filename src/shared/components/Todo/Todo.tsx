import { Link } from 'react-router-dom';
import { Loading } from '../../ui/StatusWidgets';
import { LockSymbol } from '../../ui/Indicators';
import { useTodo } from '../../../api';
import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

const Todo = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const { data } = useTodo({ idArea, idSector });

  if (!data) {
    return <Loading />;
  }

  if ((data.sectors ?? []).length === 0) {
    return <p className={cn(designContract.typography.meta, 'text-center text-slate-500 italic')}>Empty list.</p>;
  }

  return (
    <div className='space-y-8'>
      {(data.sectors ?? []).map((sector) => (
        <div key={sector.id} className='space-y-3'>
          {idArea > 0 && (
            <div className='border-surface-border flex items-center gap-2 border-b pb-2'>
              <Link
                to={`/sector/${sector.id}`}
                className={cn(
                  designContract.typography.subtitle,
                  'text-slate-100 transition-colors hover:text-slate-50',
                )}
              >
                {sector.name}
              </Link>
              <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
            </div>
          )}

          <div className='flex flex-col gap-y-3'>
            {(sector.problems ?? []).map((problem) => (
              <p
                key={problem.id}
                className={cn(
                  designContract.typography.body,
                  'min-w-0 leading-relaxed [overflow-wrap:anywhere] text-slate-300',
                )}
              >
                <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
                  #{problem.nr}
                </span>{' '}
                <Link
                  to={`/problem/${problem.id}`}
                  className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}
                >
                  {problem.name}
                </Link>
                {problem.grade ? (
                  <>
                    {' '}
                    <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
                      {problem.grade}
                    </span>
                  </>
                ) : null}
                <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                {problem.partners && problem.partners.length > 0 ? (
                  <>
                    {' '}
                    <span className='text-slate-600'>·</span>{' '}
                    {problem.partners.map((u, i) => (
                      <span key={u.id}>
                        {i > 0 ? ', ' : ''}
                        <Link to={`/user/${u.id}/todo`} className={designContract.typography.listLinkMuted}>
                          {u.name}
                        </Link>
                      </span>
                    ))}
                  </>
                ) : null}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Todo;
