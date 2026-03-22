import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import {
  Filter,
  ChevronDown,
  Plus,
  Check,
  ImageIcon,
  MessageSquare,
  Film,
  Camera,
} from 'lucide-react';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../meta/context';
import { getMediaFileUrl, useActivity } from '../../../api';
import { ClickableAvatar } from '../../ui/Avatar';
import { Stars } from '../widgets/widgets';
import { cn } from '../../../lib/utils';
import { ProblemLink } from './components/ProblemLink';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivityUser = components['schemas']['User'];

const Activity = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [lowerGradeId, setLowerGradeId] = useLocalStorage('lower_grade_id', 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage('lower_grade_text', 'n/a');
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage('activity_type_ticks', true);
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage('activity_type_fa', true);
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage(
    'activity_type_comments',
    true,
  );
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage('activity_type_media', true);

  const meta = useMeta();
  const {
    data: activity,
    refetch,
    isPending,
  } = useActivity({
    idArea,
    idSector,
    lowerGrade: lowerGradeId,
    fa: activityTypeFa,
    comments: activityTypeComments,
    ticks: activityTypeTicks,
    media: activityTypeMedia,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-4 sm:px-0'>
        <h2 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:block'>
          Latest Activity
        </h2>
        <div className='flex flex-wrap items-center gap-1.5 ml-auto'>
          <div className='relative' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='btn-glass btn-glass-active h-7!'
            >
              <Filter size={12} />{' '}
              <span className='text-[10px] uppercase font-bold'>
                {lowerGradeText === 'n/a' ? 'ALL' : lowerGradeText}
              </span>{' '}
              <ChevronDown
                size={10}
                className={cn('transition-transform', isFilterOpen && 'rotate-180')}
              />
            </button>
            {isFilterOpen && (
              <div className='absolute top-full right-0 mt-1 w-48 bg-surface-card border border-surface-border rounded-lg shadow-2xl py-1 z-50 max-h-60 overflow-y-auto'>
                <div className='px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border/50 mb-1'>
                  Lowest Grade
                </div>
                {meta.grades.map((g) => (
                  <button
                    key={g.id}
                    className={cn(
                      'w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between',
                      g.id === lowerGradeId
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-slate-400 hover:bg-surface-hover',
                    )}
                    onClick={() => {
                      setLowerGradeId(g.id);
                      setLowerGradeText(
                        g.id === 0
                          ? 'ALL'
                          : g.grade.includes('(')
                            ? g.grade.split('(')[1].replace(')', '')
                            : g.grade,
                      );
                      setIsFilterOpen(false);
                      setTimeout(refetch, 10);
                    }}
                  >
                    {g.id === 0 ? 'ALL' : g.grade} {g.id === lowerGradeId && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setActivityTypeFa(!activityTypeFa);
              setTimeout(refetch, 10);
            }}
            className={cn('btn-glass h-7!', activityTypeFa && 'btn-glass-active')}
          >
            <Plus size={12} /> <span className='text-[10px] uppercase font-bold'>FA</span>
          </button>
          <button
            onClick={() => {
              setActivityTypeTicks(!activityTypeTicks);
              setTimeout(refetch, 10);
            }}
            className={cn('btn-glass h-7!', activityTypeTicks && 'btn-glass-active')}
          >
            <Check size={12} /> <span className='text-[10px] uppercase font-bold'>Ticks</span>
          </button>
          <button
            onClick={() => {
              setActivityTypeMedia(!activityTypeMedia);
              setTimeout(refetch, 10);
            }}
            className={cn('btn-glass h-7!', activityTypeMedia && 'btn-glass-active')}
          >
            <Camera size={12} /> <span className='text-[10px] uppercase font-bold'>Media</span>
          </button>
          <button
            onClick={() => {
              setActivityTypeComments(!activityTypeComments);
              setTimeout(refetch, 10);
            }}
            className={cn('btn-glass h-7!', activityTypeComments && 'btn-glass-active')}
          >
            <MessageSquare size={12} /> <span className='text-[10px] uppercase font-bold'>Com</span>
          </button>
        </div>
      </div>

      <div className='bg-surface-card sm:border sm:border-surface-border sm:rounded-xl overflow-hidden -mx-4 sm:mx-0'>
        <div className='divide-y divide-surface-border/30'>
          {isPending
            ? [...Array(6)].map((_, i) => <div key={i} className='h-20 animate-pulse' />)
            : activity?.map((a) => {
                const currentKey = a.activityIds?.join('+') ?? `activity-${a.id ?? 0}`;
                const [numImg, numMov] = (a.media ?? []).reduce(
                  (acc: number[], { movie }) =>
                    movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]],
                  [0, 0],
                );

                return (
                  <div
                    key={currentKey}
                    className='p-4 hover:bg-white/1 transition-colors text-left'
                  >
                    <div className='flex gap-4 items-start'>
                      <div className='shrink-0 mt-0.5'>
                        {a.users ? (
                          (a.problemRandomMediaId ?? 0) > 0 ? (
                            <img
                              src={getMediaFileUrl(
                                Number(a.problemRandomMediaId),
                                Number(a.problemRandomMediaVersionStamp),
                                false,
                                { minDimension: 40 },
                              )}
                              className='w-9 h-9 rounded-md object-cover border border-surface-border'
                              alt=''
                            />
                          ) : (
                            <div className='w-9 h-9 rounded-md bg-surface-nav border border-surface-border flex items-center justify-center text-slate-700'>
                              <Plus size={16} />
                            </div>
                          )
                        ) : (
                          <ClickableAvatar
                            name={a.name}
                            mediaId={a.mediaId}
                            mediaVersionStamp={a.mediaVersionStamp}
                            size='tiny'
                          />
                        )}
                      </div>
                      <div className='flex-1 min-w-0 pr-2'>
                        <div className='flex items-baseline justify-between gap-4'>
                          <div className='text-[14px] text-slate-500 wrap-break-word whitespace-normal leading-relaxed overflow-hidden'>
                            {a.users ? (
                              <span>
                                New {meta.isBouldering ? 'problem' : 'route'} in{' '}
                                <ProblemLink a={a} />
                              </span>
                            ) : a.message ? (
                              <span>
                                <Link
                                  to={`/user/${a.id}`}
                                  className='font-semibold text-slate-200 hover:text-brand transition-colors'
                                >
                                  {a.name}
                                </Link>{' '}
                                posted a comment on <ProblemLink a={a} />
                              </span>
                            ) : (
                              <span>
                                {a.name ? (
                                  <>
                                    <Link
                                      to={`/user/${a.id}`}
                                      className='font-semibold text-slate-200 hover:text-brand transition-colors'
                                    >
                                      {a.name}
                                    </Link>{' '}
                                    <span className='text-slate-500 font-medium ml-1'>
                                      {a.repeat ? 'repeated' : 'ticked'}
                                    </span>{' '}
                                  </>
                                ) : (
                                  <span className='font-semibold text-slate-200'>
                                    {numImg > 0 && (
                                      <>
                                        {numImg} new{' '}
                                        <ImageIcon size={10} className='inline mb-0.5' />{' '}
                                      </>
                                    )}
                                    {numImg > 0 && numMov > 0 && 'and '}
                                    {numMov > 0 && (
                                      <>
                                        {numMov} new{' '}
                                        <Film size={12} className='inline mb-0.5' />{' '}
                                      </>
                                    )}{' '}
                                    on{' '}
                                  </span>
                                )}
                                <ProblemLink a={a} />
                              </span>
                            )}
                          </div>
                          <span className='shrink-0 text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1'>
                            {a.timeAgo}
                          </span>
                        </div>
                        {a.description && (
                          <div className='mt-1 text-slate-400 text-[11px] italic leading-snug pl-2 border-l border-surface-border wrap-break-word whitespace-normal'>
                            {a.description}
                          </div>
                        )}
                        {a.message && (
                          <div className='mt-1 text-slate-400 text-[11px] border-l border-brand/20 pl-2 italic leading-snug wrap-break-word whitespace-normal'>
                            <Linkify>{a.message}</Linkify>
                          </div>
                        )}
                        {a.media && (
                          <div className='mt-3'>
                            <LazyMedia media={a.media} problemId={a.problemId} />
                          </div>
                        )}
                        <div className='mt-3 flex items-center gap-3'>
                          {a.users && (
                            <div className='flex -space-x-1.5'>
                              {a.users.map((u: ActivityUser) => (
                                <ClickableAvatar
                                  key={u.id}
                                  name={u.name}
                                  mediaId={u.mediaId}
                                  mediaVersionStamp={u.mediaVersionStamp}
                                  size='mini'
                                  className='ring-1 ring-surface-card'
                                />
                              ))}
                            </div>
                          )}
                          {a.stars !== undefined && a.stars !== -1 && (
                            <Stars numStars={a.stars} includeStarOutlines={true} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Activity;
