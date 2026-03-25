import type { SyntheticEvent } from 'react';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { getMediaFileUrl, useTrash } from '../../api';
import { useMeta } from '../../shared/components/Meta';
import { useNavigate } from 'react-router';
import type { components } from '../../@types/buldreinfo/swagger';
import { Trash2, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const getKey = ({ idArea, idSector, idProblem, idMedia }: components['schemas']['Trash']) => {
  return [idArea, idSector, idProblem, idMedia].join('/');
};

const getLabel = ({ idMedia, idArea, idSector, idProblem }: components['schemas']['Trash']): string => {
  if (idMedia) return 'Media';
  if (idArea) return 'Area';
  if (idSector) return 'Sector';
  if (idProblem) return 'Problem';
  return '';
};

const Trash = () => {
  const navigate = useNavigate();
  const meta = useMeta();
  const { data, restore } = useTrash();

  if (!data) {
    return <Loading />;
  }

  return (
    <div className={designContract.layout.pageSection}>
      <title>{`Trash | ${meta?.title}`}</title>

      <div className={cn(designContract.surfaces.card, 'overflow-hidden rounded-xl')}>
        <div className='border-surface-border bg-surface-nav/20 flex items-center gap-4 border-b p-6'>
          <div className='rounded-xl bg-red-500/10 p-3 text-red-500'>
            <Trash2 size={24} />
          </div>
          <div>
            <h2 className='type-h2'>Trash</h2>
            <p className={designContract.typography.label}>{data.length} items</p>
          </div>
        </div>

        <div className='divide-surface-border divide-y'>
          {!data.length ? (
            <div className='p-8 text-center text-slate-500 italic'>No data</div>
          ) : (
            data.map((t) => {
              const key = getKey(t);
              return (
                <div
                  key={key}
                  className='flex items-center justify-between gap-4 p-4 transition-colors hover:bg-white/5'
                >
                  <div className='flex min-w-0 items-center gap-4'>
                    {!!t.idMedia && (
                      <img
                        alt={t.name ?? ''}
                        src={getMediaFileUrl(t.idMedia, 0, false, { minDimension: 50 })}
                        onError={(e: SyntheticEvent<HTMLImageElement, Event>) =>
                          (e.currentTarget.src = '/png/video_placeholder.png')
                        }
                        className='border-surface-border h-12 w-12 shrink-0 rounded-lg border object-cover'
                      />
                    )}
                    <div className='min-w-0'>
                      <h4 className='truncate text-sm font-bold text-slate-200'>{t.name}</h4>
                      <p className='text-xs text-slate-500'>{`${getLabel(t)} deleted by ${t.by} (${t.when})`}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to restore item?')) {
                        restore(t).then((url) => {
                          navigate(url);
                        });
                      }
                    }}
                    className='bg-surface-nav border-surface-border hover:bg-brand hover:border-brand type-label flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 opacity-85 shadow-sm transition-all hover:opacity-100'
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Trash;
