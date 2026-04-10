import { useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { getMediaFileUrl, useTrash } from '../../api';
import { useMeta } from '../../shared/components/Meta';
import { useNavigate } from 'react-router';
import type { components } from '../../@types/buldreinfo/swagger';
import { Trash2, RotateCcw } from 'lucide-react';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import { Card, SectionHeader } from '../../shared/ui';
import AvatarModal from '../../shared/ui/Avatar/AvatarModal';

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
  const [openMedia, setOpenMedia] = useState<{ mid: number; name?: string } | null>(null);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className='w-full min-w-0'>
      <title>{`Trash | ${meta?.title}`}</title>

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 sm:p-5'>
          <SectionHeader title='Trash' icon={Trash2} subheader={`${data.length} items`} />
        </div>

        <div className='space-y-1 px-2 pb-2 sm:px-3 sm:pb-3'>
          {!data.length ? (
            <div className='px-4 py-14 text-center sm:px-5 sm:py-18'>
              <p className={designContract.typography.label}>No data</p>
            </div>
          ) : (
            data.map((t) => {
              const key = getKey(t);
              const mediaUrl = t.idMedia ? getMediaFileUrl(t.idMedia, 0, false) : null;
              return (
                <div
                  key={key}
                  className='hover:bg-surface-raised-hover flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors sm:px-4'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    {!!t.idMedia && (
                      <button
                        type='button'
                        onClick={() => setOpenMedia({ mid: t.idMedia!, name: t.name ?? '' })}
                        className='shrink-0'
                      >
                        <img
                          alt={t.name ?? ''}
                          src={getMediaFileUrl(t.idMedia, 0, false, { minDimension: 50 })}
                          className='border-surface-border h-11 w-11 rounded-md border object-cover'
                        />
                      </button>
                    )}
                    <div className='min-w-0'>
                      <h4 className={cn('truncate text-sm font-semibold text-slate-200', twInk.lightTextSlate900)}>
                        {t.name}
                      </h4>
                      <p className={cn('truncate text-[11px] text-slate-500', twInk.lightTextSlate700)}>
                        {mediaUrl ? (
                          <>
                            <button
                              type='button'
                              onClick={() => setOpenMedia({ mid: t.idMedia!, name: t.name ?? '' })}
                              className={cn(
                                designContract.typography.breadcrumbLink,
                                'underline-offset-2 hover:underline',
                              )}
                            >
                              Media
                            </button>{' '}
                            deleted by {t.by} ({t.when})
                          </>
                        ) : (
                          `${getLabel(t)} deleted by ${t.by} (${t.when})`
                        )}
                      </p>
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
                    className={cn(
                      'border-surface-border/60 bg-surface-raised hover:bg-surface-hover inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors',
                      twInk.lightTextSlate800,
                    )}
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
      {openMedia && <AvatarModal mid={openMedia.mid} name={openMedia.name} onClose={() => setOpenMedia(null)} />}
    </div>
  );
};

export default Trash;
