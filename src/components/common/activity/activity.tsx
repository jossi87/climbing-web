import { useState, useRef, useEffect, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import { Filter, ChevronDown, Plus, Check, MessageSquare, Camera } from 'lucide-react';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../meta/context';
import { useActivity } from '../../../api';
import { Avatar, AvatarGroup, Card, SectionLabel } from '../../ui';
import { Stars } from '../widgets/widgets';
import { cn } from '../../../lib/utils';
import { ProblemLink } from './components/ProblemLink';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

const ActivitySkeleton = () => (
  <div className='p-3 border-b border-white/5 last:border-0 min-h-16 animate-pulse'>
    <div className='flex gap-4 items-start'>
      <div className='w-8 h-8 rounded-full bg-surface-nav' />
      <div className='flex-1 space-y-1.5'>
        <div className='h-3 bg-surface-nav rounded w-2/3' />
        <div className='h-2 bg-surface-nav rounded w-1/3' />
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
    if (type === 'fa') setActivityTypeFa(!activityTypeFa);
    if (type === 'ticks') setActivityTypeTicks(!activityTypeTicks);
    if (type === 'media') setActivityTypeMedia(!activityTypeMedia);
    if (type === 'comments') setActivityTypeComments(!activityTypeComments);
    setTimeout(refetch, 10);
  };

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 px-4 sm:px-0'>
        <SectionLabel className='hidden sm:block text-slate-400 font-bold uppercase tracking-widest text-[10px]'>
          Latest Activity
        </SectionLabel>

        <div className='flex flex-wrap items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto'>
          <div className='relative' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='btn-glass btn-glass-active'
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
                <div className='px-4 py-1.5 border-b border-surface-border/50 mb-1'>
                  <SectionLabel className='text-[9px]'>Lowest Grade</SectionLabel>
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

          <FilterButton
            active={activityTypeFa}
            onClick={() => handleFilterToggle('fa')}
            icon={Plus}
            label='FA'
          />
          <FilterButton
            active={activityTypeTicks}
            onClick={() => handleFilterToggle('ticks')}
            icon={Check}
            label='Ticks'
          />
          <FilterButton
            active={activityTypeMedia}
            onClick={() => handleFilterToggle('media')}
            icon={Camera}
            label='Media'
          />
          <FilterButton
            active={activityTypeComments}
            onClick={() => handleFilterToggle('comments')}
            icon={MessageSquare}
            label='Com'
          />
        </div>
      </div>

      <Card flush className='divide-y divide-white/5'>
        {isPending
          ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} />)
          : activity?.map((a) => (
              <ActivityItem
                key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                a={a}
                isBouldering={meta.isBouldering}
              />
            ))}
      </Card>
    </div>
  );
};

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  label: string;
};

const FilterButton = ({ active, onClick, icon: Icon, label }: FilterButtonProps) => (
  <button onClick={onClick} className={cn('btn-glass', active && 'btn-glass-active')}>
    <Icon size={12} /> <span className='text-[10px] uppercase font-bold'>{label}</span>
  </button>
);

type ActivityItemProps = {
  a: ActivitySchema;
  isBouldering: boolean;
};

const ActivityItem = ({ a, isBouldering }: ActivityItemProps) => {
  const avatarItems =
    (a.activityThumbnails ?? []).length > 0
      ? a.activityThumbnails!.map((m) => ({ mediaId: m.id, mediaVersionStamp: m.versionStamp }))
      : (a.users ?? []).length > 0
        ? a.users!.map((u) => ({
            name: u.name,
            mediaId: u.mediaId,
            mediaVersionStamp: u.mediaVersionStamp,
          }))
        : [{ name: a.name, mediaId: undefined, mediaVersionStamp: undefined }];

  const statusIcon = (() => {
    if (a.users) return <Plus size={8} className='text-brand' />;
    if (a.message) return <MessageSquare size={8} className='text-blue-400' />;
    if (a.media && !a.name) return <Camera size={8} className='text-emerald-400' />;
    return <Check size={8} className='text-emerald-400' />;
  })();

  const [numImg, numMov] = (a.media ?? []).reduce(
    (acc: number[], item) => (item.movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
    [0, 0],
  );

  return (
    <div className='py-3 px-4 hover:bg-white/1.5 transition-colors group'>
      <div className='flex gap-3 sm:gap-4 items-start'>
        <div className='shrink-0 pt-0.5'>
          <AvatarGroup items={avatarItems} size='tiny' statusIcon={statusIcon} max={2} />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='text-slate-400 text-[14px] leading-relaxed'>
            <span className='float-right ml-4 text-[9px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-400 transition-colors pt-0.5 select-none'>
              {a.timeAgo}
            </span>

            {a.users && a.users.length > 0 && a.repeat === undefined ? (
              <>
                <span className='font-bold text-slate-200'>
                  New {isBouldering ? 'problem' : 'route'}
                </span>{' '}
                <span>in</span> <ProblemLink a={a} />
              </>
            ) : a.message ? (
              <>
                <Link
                  to={`/user/${a.id}`}
                  className='font-bold text-slate-200 hover:text-brand transition-colors'
                >
                  {a.name}
                </Link>{' '}
                <span>commented on</span> <ProblemLink a={a} />
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
                    </Link>{' '}
                    <span>{a.repeat ? 'repeated' : 'ticked'}</span>{' '}
                  </>
                ) : numImg > 0 || numMov > 0 ? (
                  <>
                    <span className='font-bold text-slate-200'>
                      {numImg > 0 && `${numImg} ${numImg === 1 ? 'image' : 'images'}`}
                      {numImg > 0 && numMov > 0 && ' & '}
                      {numMov > 0 && `${numMov} ${numMov === 1 ? 'video' : 'videos'}`}
                    </span>{' '}
                    <span>on</span>{' '}
                  </>
                ) : null}
                <ProblemLink a={a} />
              </>
            )}
          </div>

          {(a.description || a.message) && (
            <div className='mt-1 text-slate-400 text-[12.5px] italic leading-relaxed pl-3 border-l border-white/10'>
              {a.message ? <Linkify>{a.message}</Linkify> : a.description}
            </div>
          )}

          {a.stars !== undefined && a.stars !== -1 && (
            <div className='mt-1 opacity-50 scale-90 origin-left grayscale'>
              <Stars numStars={a.stars} includeStarOutlines={true} />
            </div>
          )}

          {a.media && (
            <div className='mt-2'>
              <LazyMedia media={a.media} problemId={a.problemId} />
            </div>
          )}

          {a.users && a.users.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-3'>
              {a.users.map((u) => (
                <Link
                  key={u.id}
                  to={`/user/${u.id}`}
                  className='flex items-center gap-1.5 group/user'
                >
                  <Avatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='tiny'
                    className='ring-1 ring-white/10 group-hover/user:ring-brand/50 transition-all'
                  />
                  <span className='text-[11px] font-bold text-slate-400 group-hover/user:text-slate-200 transition-colors'>
                    {u.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
