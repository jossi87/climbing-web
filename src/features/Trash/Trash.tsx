import type { SyntheticEvent } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { getMediaFileUrl, useTrash } from '../../api';
import { useMeta } from '../../shared/components/Meta';
import { useNavigate } from 'react-router';
import type { components } from '../../@types/buldreinfo/swagger';
import { Trash2, RotateCcw } from 'lucide-react';
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';

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
    <div className='w-full min-w-0'>
      <title>{`Trash | ${meta?.title}`}</title>

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='border-surface-border border-b p-4 sm:p-5'>
          <SectionHeader title='Trash' icon={Trash2} subheader={`${data.length} items`} />
        </div>

        <div className='divide-surface-border/25 divide-y'>
          {!data.length ? (
            <div className='px-4 py-14 text-center sm:px-5 sm:py-18'>
              <p className={designContract.typography.label}>No data</p>
            </div>
          ) : (
            data.map((t) => {
              const key = getKey(t);
              return (
                <div
                  key={key}
                  className='flex min-w-0 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/3 sm:px-5'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    {!!t.idMedia && (
                      <img
                        alt={t.name ?? ''}
                        src={getMediaFileUrl(t.idMedia, 0, false, { minDimension: 50 })}
                        onError={(e: SyntheticEvent<HTMLImageElement, Event>) =>
                          (e.currentTarget.src = '/png/video_placeholder.png')
                        }
                        className='border-surface-border h-11 w-11 shrink-0 rounded-md border object-cover'
                      />
                    )}
                    <div className='min-w-0'>
                      <h4 className='truncate text-sm font-semibold text-slate-200'>{t.name}</h4>
                      <p className='truncate text-[10px] text-slate-500'>{`${getLabel(t)} deleted by ${t.by} (${t.when})`}</p>
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
                    className='bg-surface-nav/55 border-surface-border/60 hover:bg-surface-hover/80 inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition-colors'
                  >
                    <RotateCcw size={12} />
                    Restore
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default Trash;
