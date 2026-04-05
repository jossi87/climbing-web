import { Link } from 'react-router-dom';
import { Loading } from '../../ui/StatusWidgets';
import { LockSymbol } from '../../ui/Indicators';
import { useTodo } from '../../../api';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import {
  profileRowRootClass,
  tickCragLink,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from '../Profile/profileRowTypography';

const lockInlineClass = 'ml-1 inline-block align-middle';

const Todo = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const { data } = useTodo({ idArea, idSector });

  if (!data) {
    return <Loading />;
  }

  if ((data.sectors ?? []).length === 0) {
    return <p className={cn(profileRowRootClass, tickFlags, 'text-center text-slate-500 italic')}>Empty list.</p>;
  }

  return (
    <div className='space-y-6'>
      {(data.sectors ?? []).map((sector) => (
        <div key={sector.id} className='space-y-2.5'>
          {idArea > 0 && (
            <div className='border-surface-border flex flex-wrap items-center gap-x-2 gap-y-1 border-b pb-2'>
              <Link to={`/sector/${sector.id}`} className={cn(tickCragLink, 'font-medium')}>
                {sector.name}
              </Link>
              <span className={lockInlineClass}>
                <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
              </span>
            </div>
          )}

          <div className='flex flex-col gap-y-2'>
            {(sector.problems ?? []).map((problem) => (
              <div key={problem.id} className={cn(profileRowRootClass, 'min-w-0 text-pretty [overflow-wrap:anywhere]')}>
                <span className={cn(tickFlags, 'font-mono tabular-nums', designContract.ascentStatus.todo)}>
                  #{problem.nr}
                </span>{' '}
                <Link to={`/problem/${problem.id}`} className={tickProblemLink}>
                  {problem.name}
                </Link>
                {problem.grade ? (
                  <span className={cn(tickWhenGrade, 'ml-1 whitespace-nowrap tabular-nums')}>{problem.grade}</span>
                ) : null}
                <span className={lockInlineClass}>
                  <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                </span>
                {problem.partners && problem.partners.length > 0 ? (
                  <>
                    {' '}
                    <span className='inline-flex min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1'>
                      {problem.partners.map((u) => (
                        <Link
                          key={u.id}
                          to={`/user/${u.id}/todo`}
                          className={cn(tickFlags, 'hover:text-status-todo transition-colors')}
                        >
                          {u.name}
                        </Link>
                      ))}
                    </span>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Todo;
