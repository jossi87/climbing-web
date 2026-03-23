import { Loading } from '../widgets/widgets';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
import { ClickableAvatar } from '../../ui/Avatar/Avatar';
import { cn } from '../../../lib/utils';

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
      <table className='w-full text-left border-collapse min-w-100'>
        <thead>
          <tr className='border-b border-surface-border'>
            <th className='py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500'>
              Rank
            </th>
            <th className='py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500'>
              Completed
            </th>
            <th className='py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500'>
              <div className='flex items-center gap-2'>
                People
                <span className='inline-flex items-center justify-center bg-surface-nav border border-surface-border text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full'>
                  {top.numUsers}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-surface-border/50'>
          {top.rows?.map((t) => (
            <tr key={t.percentage} className='hover:bg-white/2 transition-colors'>
              <td className='py-3 px-4 align-top text-sm font-mono text-slate-400'>#{t.rank}</td>
              <td className='py-3 px-4 align-top text-sm font-bold text-white'>{t.percentage}%</td>
              <td className='py-2 px-4'>
                <div className='flex flex-wrap gap-2'>
                  {(t.users ?? []).map((u) => (
                    <Link
                      key={u.userId}
                      to={`/user/${u.userId}`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-lg border text-xs font-medium transition-all',
                        u.mine
                          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                          : 'bg-surface-nav border-surface-border text-slate-300 hover:text-white hover:border-slate-500',
                      )}
                    >
                      <div className='w-5 h-5 rounded-full overflow-hidden shrink-0'>
                        <ClickableAvatar
                          name={u.name}
                          mediaId={u.mediaId}
                          mediaVersionStamp={u.mediaVersionStamp}
                        />
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
