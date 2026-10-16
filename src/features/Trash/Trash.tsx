import { useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { getMediaFileUrl, useTrash } from '../../api';
import { useMeta } from '../../shared/components/Meta';
import { useNavigate } from 'react-router';
import type { components } from '../../@types/buldreinfo/swagger';
import { Trash2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import { Card, SectionHeader } from '../../shared/ui';
import AvatarModal from '../../shared/ui/Avatar/AvatarModal';

const getKey = ({ idArea, idSector, idProblem, idMedia }: components['schemas']['Trash']) => {
  return [idArea, idSector, idProblem, idMedia].join('/');
};

/**
 * Entity name of a trash row. Takes `t` because the noun is UI copy: the API only tells us *which*
 * foreign key is set.
 */
const getLabel = (t: TFunction, { idMedia, idArea, idSector, idProblem }: components['schemas']['Trash']): string => {
  if (idMedia) return t('common.media');
  if (idArea) return t('common.area');
  if (idSector) return t('common.sector');
  if (idProblem) return t('common.problem');
  return '';
};

const Trash = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const meta = useMeta();
  const { data, restore } = useTrash();
  const [openMedia, setOpenMedia] = useState<{ mid: number; name?: string } | null>(null);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className='w-full min-w-0'>
      <title>{t('meta.pageTitle', { page: t('trash.title'), site: meta.title })}</title>

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 sm:p-5'>
          <SectionHeader title={t('trash.title')} icon={Trash2} subheader={t('counts.items', { count: data.length })} />
        </div>

        <div className='space-y-1 px-2 pb-2 sm:px-3 sm:pb-3'>
          {!data.length ? (
            <div className='px-4 py-14 text-center sm:px-5 sm:py-18'>
              <p className={designContract.typography.label}>{t('common.noData')}</p>
            </div>
          ) : (
            data.map((row) => {
              const key = getKey(row);
              const mediaUrl = row.idMedia ? getMediaFileUrl(row.idMedia, 0, false) : null;
              /**
               * The API may omit the actor or timestamp (deleted-by with a purged account / older rows). Coerced here so
               * the interpolated sentence reads "deleted by  ()" at worst instead of literally printing `undefined`.
               */
              const by = row.by ?? '';
              const when = row.when ?? '';
              return (
                <div
                  key={key}
                  className='hover:bg-surface-raised-hover flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors sm:px-4'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    {!!row.idMedia && (
                      <button
                        type='button'
                        onClick={() => setOpenMedia({ mid: row.idMedia!, name: row.name ?? '' })}
                        className='shrink-0'
                      >
                        <img
                          alt={row.name ?? ''}
                          src={getMediaFileUrl(row.idMedia, 0, false, { minDimension: 50 })}
                          className='border-surface-border h-11 w-11 rounded-md border object-cover'
                        />
                      </button>
                    )}
                    <div className='min-w-0'>
                      <h4 className={cn('truncate text-sm font-semibold text-slate-200', twInk.lightTextSlate900)}>
                        {row.name}
                      </h4>
                      <p className={cn('truncate text-[11px] text-slate-500', twInk.lightTextSlate700)}>
                        {mediaUrl ? (
                          <>
                            <button
                              type='button'
                              onClick={() => setOpenMedia({ mid: row.idMedia!, name: row.name ?? '' })}
                              className={cn(
                                designContract.typography.breadcrumbLink,
                                'underline-offset-2 hover:underline',
                              )}
                            >
                              {t('common.media')}
                            </button>{' '}
                            {t('trash.deletedBy', { by, when })}
                          </>
                        ) : (
                          t('trash.deletedItem', { kind: getLabel(t, row), by, when })
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(t('trash.confirmRestore'))) {
                        restore(row).then((url) => {
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
                    {t('common.restore')}
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
