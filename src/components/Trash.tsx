import type { SyntheticEvent } from 'react';
import { Loading } from './common/widgets/widgets';
import { getMediaFileUrl, useTrash } from '../api';
import { useMeta } from './common/meta';
import { useNavigate } from 'react-router';
import type { components } from '../@types/buldreinfo/swagger';
import { Trash2, RotateCcw } from 'lucide-react';

const getKey = ({ idArea, idSector, idProblem, idMedia }: components['schemas']['Trash']) => {
  return [idArea, idSector, idProblem, idMedia].join('/');
};

const getLabel = ({
  idMedia,
  idArea,
  idSector,
  idProblem,
}: components['schemas']['Trash']): string => {
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
    <div className='space-y-6'>
      <title>{`Trash | ${meta?.title}`}</title>

      <div className='bg-surface-card border border-surface-border rounded-xl shadow-sm overflow-hidden'>
        <div className='p-6 border-b border-surface-border bg-surface-nav/20 flex items-center gap-4'>
          <div className='p-3 bg-red-500/10 rounded-xl text-red-500'>
            <Trash2 size={24} />
          </div>
          <div>
            <h2 className='text-xl font-bold text-white tracking-tight'>Trash</h2>
            <p className='text-xs text-slate-500 font-medium uppercase tracking-widest'>
              {data.length} items
            </p>
          </div>
        </div>

        <div className='divide-y divide-surface-border'>
          {!data.length ? (
            <div className='p-8 text-center text-slate-500 italic'>No data</div>
          ) : (
            data.map((t) => {
              const key = getKey(t);
              return (
                <div
                  key={key}
                  className='p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors'
                >
                  <div className='flex items-center gap-4 min-w-0'>
                    {!!t.idMedia && (
                      <img
                        alt={t.name ?? ''}
                        src={getMediaFileUrl(t.idMedia, 0, false, { minDimension: 50 })}
                        onError={(e: SyntheticEvent<HTMLImageElement, Event>) =>
                          (e.currentTarget.src = '/png/video_placeholder.png')
                        }
                        className='w-12 h-12 rounded-lg object-cover border border-surface-border shrink-0'
                      />
                    )}
                    <div className='min-w-0'>
                      <h4 className='text-sm font-bold text-slate-200 truncate'>{t.name}</h4>
                      <p className='text-xs text-slate-500'>
                        {`${getLabel(t)} deleted by ${t.by} (${t.when})`}
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
                    className='flex items-center gap-2 px-4 py-2 bg-surface-nav border border-surface-border hover:bg-brand hover:border-brand text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 shadow-sm'
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
