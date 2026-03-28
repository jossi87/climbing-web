import { Loading } from '../../ui/StatusWidgets';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
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
          <tr className='border-surface-border/40 border-b'>
            <th className={cn('w-12 px-2 py-2 sm:px-3', designContract.typography.label)}>#</th>
            <th className={cn('w-16 px-2 py-2 sm:px-3', designContract.typography.label)}>%</th>
            <th className={cn('px-2 py-2 sm:px-3', designContract.typography.label)}>
              Climbers
              <span className={cn(designContract.typography.meta, 'ml-1.5 font-normal text-slate-500 normal-case')}>
                ({top.numUsers})
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {top.rows?.map((t) => (
            <tr key={t.percentage} className='transition-colors hover:bg-white/[0.02]'>
              <td
                className={cn(
                  'px-2 py-2 align-top font-mono tabular-nums sm:px-3',
                  designContract.typography.body,
                  'text-slate-200',
                )}
              >
                {t.rank}
              </td>
              <td
                className={cn(
                  'px-2 py-2 align-top tabular-nums sm:px-3',
                  designContract.typography.body,
                  designContract.typography.listEmphasis,
                  'text-slate-200',
                )}
              >
                {t.percentage}%
              </td>
              <td
                className={cn(
                  'px-2 py-2 align-top sm:px-3',
                  designContract.typography.body,
                  'leading-relaxed text-slate-300',
                )}
              >
                {(t.users ?? []).map((u, i) => (
                  <span key={u.userId}>
                    {i > 0 ? ', ' : ''}
                    <Link
                      to={`/user/${u.userId}`}
                      className={
                        u.mine
                          ? 'text-emerald-400/90 transition-colors hover:text-emerald-300'
                          : designContract.typography.listLink
                      }
                    >
                      {u.name}
                    </Link>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top;
