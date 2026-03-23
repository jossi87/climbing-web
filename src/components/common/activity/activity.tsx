import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import { Filter, ChevronDown, Plus, Check, MessageSquare, Camera } from 'lucide-react';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../meta/context';
import { useActivity } from '../../../api';
import { AvatarGroup } from '../../ui/Avatar/Avatar';
import { Stars } from '../widgets/widgets';
import { cn } from '../../../lib/utils';
import { ProblemLink } from './components/ProblemLink';
import { LazyMedia } from './components/LazyMedia';

const ActivitySkeleton = () => (
  <div className='p-4 text-left border-b border-surface-border/30 last:border-0 min-h-25'>
    <div className='flex gap-4 items-start animate-pulse'>
      <div className='shrink-0 pt-1.5'>
        <div className='w-8 h-8 rounded-full bg-surface-nav' />
      </div>
      <div className='flex-1 space-y-3 pt-1'>
        <div className='flex justify-between items-start gap-4'>
          <div className='h-4 bg-surface-nav rounded w-2/3' />
          <div className='h-2 bg-surface-nav rounded w-12 pt-1.5' />
        </div>
        <div className='h-3 bg-surface-nav rounded w-1/3' />
        <div className='flex gap-2 mt-3'>
          <div className='w-16 h-12 bg-surface-nav rounded-md opacity-40' />
          <div className='w-16 h-12 bg-surface-nav rounded-md opacity-40' />
        </div>
        <div className='mt-2 flex items-center gap-1'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='w-3 h-3 bg-surface-nav rounded-full opacity-30' />
          ))}
        </div>
      </div>
    </div>
  </div>
);

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

  const handleFilterToggle = (type: string) => {
    switch (type) {
      case 'fa':
        setActivityTypeFa(!activityTypeFa);
        break;
      case 'ticks':
        setActivityTypeTicks(!activityTypeTicks);
        break;
      case 'media':
        setActivityTypeMedia(!activityTypeMedia);
        break;
      case 'comments':
        setActivityTypeComments(!activityTypeComments);
        break;
    }
    setTimeout(refetch, 10);
  };

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-4 sm:px-0'>
        <h2 className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:block shrink-0'>
          Latest Activity
        </h2>

        <div className='flex flex-wrap items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto'>
          <div className='relative' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='btn-glass btn-glass-active h-7!'
            >
              <Filter size={12} />
              <span className='text-[10px] uppercase font-bold'>
                {lowerGradeText === 'n/a' ? 'ALL' : lowerGradeText}
              </span>
              <ChevronDown
                size={10}
                className={cn('transition-transform', isFilterOpen && 'rotate-180')}
              />
            </button>

            {isFilterOpen && (
              <div className='absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-1 w-48 bg-surface-card border border-surface-border rounded-lg shadow-2xl py-1 z-50 max-h-60 overflow-y-auto'>
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
                          : g.grade?.includes('(')
                            ? g.grade.split('(')[1].replace(')', '')
                            : (g.grade ?? ''),
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
            onClick={() => handleFilterToggle('fa')}
            className={cn('btn-glass h-7!', activityTypeFa && 'btn-glass-active')}
          >
            <Plus size={12} /> <span className='text-[10px] uppercase font-bold'>FA</span>
          </button>
          <button
            onClick={() => handleFilterToggle('ticks')}
            className={cn('btn-glass h-7!', activityTypeTicks && 'btn-glass-active')}
          >
            <Check size={12} /> <span className='text-[10px] uppercase font-bold'>Ticks</span>
          </button>
          <button
            onClick={() => handleFilterToggle('media')}
            className={cn('btn-glass h-7!', activityTypeMedia && 'btn-glass-active')}
          >
            <Camera size={12} /> <span className='text-[10px] uppercase font-bold'>Media</span>
          </button>
          <button
            onClick={() => handleFilterToggle('comments')}
            className={cn('btn-glass h-7!', activityTypeComments && 'btn-glass-active')}
          >
            <MessageSquare size={12} /> <span className='text-[10px] uppercase font-bold'>Com</span>
          </button>
        </div>
      </div>

      <div className='app-card'>
        <div className='divide-y divide-surface-border/30 min-h-100'>
          {isPending
            ? [...Array(8)].map((_, i) => <ActivitySkeleton key={i} />)
            : activity?.map((a) => {
                const currentKey = a.activityIds?.join('+') ?? `activity-${a.id ?? 0}`;
                const [numImg, numMov] = (a.media ?? []).reduce(
                  (acc: number[], { movie }) =>
                    movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]],
                  [0, 0],
                );

                const getStatusIcon = () => {
                  if (a.users) return <Plus size={8} className='text-brand' />;
                  if (a.message) return <MessageSquare size={8} className='text-blue-400' />;
                  if (a.media && !a.name) return <Camera size={8} className='text-amber-400' />;
                  return <Check size={8} className='text-emerald-400' />;
                };

                const avatarItems =
                  a.activityThumbnails && a.activityThumbnails.length > 0
                    ? a.activityThumbnails.map((m) => ({
                        mediaId: m.id,
                        mediaVersionStamp: m.versionStamp,
                      }))
                    : a.users && a.users.length > 0
                      ? a.users.map((u) => ({
                          name: u.name,
                          mediaId: u.mediaId,
                          mediaVersionStamp: u.mediaVersionStamp,
                        }))
                      : [{ name: a.name, mediaId: undefined, mediaVersionStamp: undefined }];

                return (
                  <div
                    key={currentKey}
                    className='py-4 sm:px-4 px-0 hover:bg-white/1 transition-colors text-left group animate-in fade-in duration-300'
                  >
                    <div className='flex gap-4 items-start px-4 sm:px-0'>
                      <div className='shrink-0 pt-1.5'>
                        <AvatarGroup
                          items={avatarItems}
                          size='tiny'
                          statusIcon={getStatusIcon()}
                          max={2}
                        />
                      </div>

                      <div className='flex-1 min-w-0 pt-1'>
                        <div className='flex items-baseline justify-between gap-4'>
                          <div className='text-[14px] text-slate-500 leading-tight flex flex-wrap items-center gap-x-1.5'>
                            {a.users ? (
                              <>
                                <span className='font-bold text-slate-200'>
                                  New {meta.isBouldering ? 'problem' : 'route'}
                                </span>
                                <span className='text-slate-500 font-medium'>in</span>
                                <ProblemLink a={a} />
                              </>
                            ) : a.message ? (
                              <>
                                <Link
                                  to={`/user/${a.id}`}
                                  className='font-bold text-slate-200 hover:text-brand transition-colors'
                                >
                                  {a.name}
                                </Link>
                                <span className='text-slate-500 font-medium'>commented on</span>
                                <ProblemLink a={a} />
                              </>
                            ) : (
                              <>
                                {a.name ? (
                                  <>
                                    <Link
                                      to={`/user/${a.id}`}
                                      className='font-bold text-slate-200 hover:text-brand transition-colors'
                                    >
                                      {a.name}
                                    </Link>
                                    <span className='text-slate-500 font-medium'>
                                      {a.repeat ? 'repeated' : 'ticked'}
                                    </span>
                                  </>
                                ) : (
                                  <span className='font-bold text-slate-200 flex items-center gap-1.5'>
                                    {numImg > 0 && (
                                      <>
                                        {numImg} {numImg === 1 ? 'image' : 'images'}
                                      </>
                                    )}
                                    {numImg > 0 && numMov > 0 && <span>&</span>}
                                    {numMov > 0 && (
                                      <>
                                        {numMov} {numMov === 1 ? 'video' : 'videos'}
                                      </>
                                    )}
                                    <span className='font-medium text-slate-500'>on</span>
                                  </span>
                                )}
                                <ProblemLink a={a} />
                              </>
                            )}
                          </div>
                          <span className='shrink-0 text-[9px] font-bold text-slate-600 uppercase tracking-tighter pt-1.5'>
                            {a.timeAgo}
                          </span>
                        </div>
                        {a.description && (
                          <div className='mt-1 text-slate-400 text-[11px] italic leading-snug pl-2 border-l border-surface-border'>
                            {a.description}
                          </div>
                        )}
                        {a.message && (
                          <div className='mt-1 text-slate-400 text-[11px] border-l border-brand/20 pl-2 italic leading-snug'>
                            <Linkify>{a.message}</Linkify>
                          </div>
                        )}
                        <div className='mt-2.5 flex items-center gap-3'>
                          {a.stars !== undefined && a.stars !== -1 && (
                            <Stars numStars={a.stars} includeStarOutlines={true} />
                          )}
                        </div>
                      </div>
                    </div>
                    {a.media && (
                      <div className='mt-3'>
                        <LazyMedia media={a.media} problemId={a.problemId} />
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Activity;
