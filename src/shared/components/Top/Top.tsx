import { Loading } from '../../ui/StatusWidgets';
import { Avatar } from '../../ui';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { profileRowRootClass, tickFlags, tickWhenGrade } from '../Profile/profileRowTypography';

type TopProps = {
  idArea: number;
  idSector: number;
};

const Top = ({ idArea, idSector }: TopProps) => {
  const { data: top } = useTop({ idArea, idSector });

  if (!top) {
    return <Loading />;
  }

  const cellPad = 'px-2 py-1.5 align-top sm:px-3 sm:py-2';

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-100 border-collapse text-left'>
        <thead>
          <tr className='border-surface-border/40 border-b'>
            <th className={cn('w-12', cellPad, designContract.typography.label)}>#</th>
            <th className={cn('w-16', cellPad, designContract.typography.label)}>%</th>
            <th className={cn(cellPad, designContract.typography.label)}>
              Climbers
              <span className={cn(tickFlags, 'ml-1.5 font-normal normal-case')}>({top.numUsers})</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {top.rows?.map((t) => (
            <tr key={t.percentage} className='transition-colors hover:bg-white/[0.02]'>
              <td className={cn(cellPad, profileRowRootClass, tickFlags, 'font-mono tabular-nums')}>{t.rank}</td>
              <td className={cn(cellPad, profileRowRootClass, tickWhenGrade, 'tabular-nums')}>{t.percentage}%</td>
              <td className={cn(cellPad, profileRowRootClass, 'text-slate-300')}>
                <span className='inline-flex min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1.5'>
                  {(t.users ?? []).map((u) => (
                    <Link
                      key={u.userId}
                      to={`/user/${u.userId}`}
                      className={cn(
                        tickFlags,
                        'inline-flex max-w-full min-w-0 items-center gap-1.5 leading-snug transition-colors',
                        u.mine ? 'text-emerald-400/90 hover:text-emerald-300' : 'hover:text-brand',
                      )}
                    >
                      <Avatar
                        name={u.name}
                        mediaId={u.mediaId}
                        mediaVersionStamp={u.mediaVersionStamp}
                        size='micro'
                        className={cn('shrink-0 ring-1 ring-white/10 transition-all', u.mine && 'ring-emerald-500/35')}
                      />
                      <span className='min-w-0'>{u.name}</span>
                    </Link>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top;
