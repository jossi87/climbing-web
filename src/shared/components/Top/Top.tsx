import { Loading } from '../../ui/StatusWidgets';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
import { ClickableAvatar } from '../../ui/Avatar/Avatar';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type TopProps = {
  idArea: number;
  idSector: number;
};

const Top = ({ idArea, idSector }: TopProps) => {
  const { data: top } = useTop({ idArea, idSector });

  if (!top) {
    return <Loading />;
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-100 border-collapse text-left'>
        <thead>
          <tr className='border-surface-border border-b'>
            <th className={cn('px-4 py-3', designContract.typography.label)}>Rank</th>
            <th className={cn('px-4 py-3', designContract.typography.label)}>Completed</th>
            <th className={cn('px-4 py-3', designContract.typography.label)}>
              <div className='flex items-center gap-2'>
                People
                <span className='bg-surface-nav border-surface-border inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 font-mono text-[10px]'>
                  {top.numUsers}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className='divide-surface-border/50 divide-y'>
          {top.rows?.map((t) => (
            <tr key={t.percentage} className='transition-colors hover:bg-white/2'>
              <td className='px-4 py-3 align-top font-mono text-sm text-slate-400'>#{t.rank}</td>
              <td className='px-4 py-3 align-top text-sm font-bold'>{t.percentage}%</td>
              <td className='px-4 py-2'>
                <div className='flex flex-wrap gap-2'>
                  {(t.users ?? []).map((u) => (
                    <Link
                      key={u.userId}
                      to={`/user/${u.userId}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition-all',
                        u.mine
                          ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-surface-nav border-surface-border opacity-85 hover:border-slate-500 hover:opacity-100',
                      )}
                    >
                      <div className='h-5 w-5 shrink-0 overflow-hidden rounded-full'>
                        <ClickableAvatar name={u.name} mediaId={u.mediaId} mediaVersionStamp={u.mediaVersionStamp} />
                      </div>
                      {u.name}
                    </Link>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top;
