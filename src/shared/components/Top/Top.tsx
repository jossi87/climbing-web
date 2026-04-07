import { Loading } from '../../ui/StatusWidgets';
import { Avatar } from '../../ui';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
import { cn } from '../../../lib/utils';
import { tickOwnUserLink } from '../Profile/profileRowTypography';

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
  /** Matches dense list scale (profile rows); bright text for this table only. */
  const rowType = 'text-[12px] leading-snug tracking-tight text-slate-100 md:text-[13px]';
  const headerType = cn(rowType, 'font-bold text-slate-50');

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-100 border-collapse text-left text-slate-100'>
        <thead>
          <tr className='border-surface-border/40 border-b'>
            <th className={cn('w-12', cellPad, headerType)}>#</th>
            <th className={cn('w-16', cellPad, headerType)}>%</th>
            <th className={cn(cellPad, headerType)}>
              Climbers
              <span className={cn(rowType, 'ml-1.5 font-normal text-slate-200 tabular-nums')}>({top.numUsers})</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {top.rows?.map((t) => (
            <tr key={t.percentage} className='hover:bg-surface-raised-hover transition-colors'>
              <td className={cn(cellPad, rowType, 'font-mono text-slate-100 tabular-nums')}>{t.rank}</td>
              <td className={cn(cellPad, rowType, 'text-slate-100 tabular-nums')}>{t.percentage}%</td>
              <td className={cn(cellPad, rowType)}>
                <span className='inline-flex min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1.5'>
                  {(t.users ?? []).map((u) => (
                    <Link
                      key={u.userId}
                      to={`/user/${u.userId}`}
                      className={cn(
                        'inline-flex max-w-full min-w-0 items-center gap-1.5 leading-snug',
                        u.mine ? tickOwnUserLink : 'hover:text-brand text-slate-100 transition-colors',
                      )}
                    >
                      <Avatar
                        name={u.name}
                        mediaId={u.mediaId}
                        mediaVersionStamp={u.mediaVersionStamp}
                        size='micro'
                        className={cn(
                          'shrink-0 ring-1 ring-white/10 transition-all',
                          u.mine && 'ring-status-ticked/35',
                        )}
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
