import { useState, useRef, useEffect, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import { Filter, ChevronDown, Plus, Check, MessageSquare, Camera } from 'lucide-react';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../Meta/context';
import { useActivity } from '../../../api';
import { Avatar, AvatarGroup, Card, SectionLabel } from '../../ui';
import { Stars } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { ProblemLink } from './components/ProblemLink';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

const ActivitySkeleton = () => (
  <div className='min-h-16 animate-pulse border-b border-white/5 p-3 last:border-0'>
    <div className='flex items-start gap-4'>
      <div className='bg-surface-nav h-8 w-8 rounded-full' />
      <div className='flex-1 space-y-1.5'>
        <div className='bg-surface-nav h-3 w-2/3 rounded' />
        <div className='bg-surface-nav h-2 w-1/3 rounded' />
      </div>
    </div>
  </div>
);

const Activity = ({ idArea, idSector, embedded = false }: { idArea: number; idSector: number; embedded?: boolean }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const selectedGradeRef = useRef<HTMLButtonElement>(null);

  const [lowerGradeId, setLowerGradeId] = useLocalStorage('lower_grade_id', 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage('lower_grade_text', 'n/a');
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage('activity_type_ticks', true);
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage('activity_type_fa', true);
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage('activity_type_comments', true);
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage('activity_type_media', true);
  const normalizedLowerGradeText = lowerGradeText === 'ALL' ? 'All' : lowerGradeText;

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
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isFilterOpen || !selectedGradeRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      selectedGradeRef.current?.scrollIntoView({ block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isFilterOpen, lowerGradeId]);

  const handleFilterToggle = (type: string) => {
    if (type === 'fa') setActivityTypeFa(!activityTypeFa);
    if (type === 'ticks') setActivityTypeTicks(!activityTypeTicks);
    if (type === 'media') setActivityTypeMedia(!activityTypeMedia);
    if (type === 'comments') setActivityTypeComments(!activityTypeComments);
    setTimeout(refetch, 10);
  };

  return (
    <div className='w-full'>
      <div className={cn(designContract.layout.toolbar, 'mb-3 sm:mb-5')}>
        <SectionLabel className='hidden text-slate-500 sm:block'>Latest activity</SectionLabel>

        <div className={designContract.layout.toolbarActions}>
          <div className='relative' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(activityChipBase, activityChipActive)}
              aria-expanded={isFilterOpen}
              type='button'
            >
              <Filter size={12} className='text-brand' strokeWidth={2} />
              <span className={cn(designContract.typography.uiCompact, 'text-slate-200')}>
                {normalizedLowerGradeText === 'n/a' ? 'All' : normalizedLowerGradeText}
              </span>
              <ChevronDown
                size={10}
                className={cn('text-slate-400 transition-transform', isFilterOpen && 'rotate-180')}
              />
            </button>

            {isFilterOpen && (
              <div className='bg-surface-card border-surface-border absolute top-full left-0 z-50 mt-1.5 max-h-[min(18rem,70vh)] w-[min(17.5rem,calc(100vw-1.25rem))] overflow-y-auto rounded-xl border py-1.5 shadow-2xl sm:right-0 sm:left-auto sm:w-56'>
                <div className='border-surface-border/40 px-3 py-2'>
                  <span className={cn(designContract.typography.label, 'text-slate-500')}>Lowest grade</span>
                </div>
                <div className='border-surface-border/35 mb-1 border-t' />
                {meta.grades
                  .slice()
                  .sort((a, b) => {
                    if (a.id === 0) return -1;
                    if (b.id === 0) return 1;
                    return b.id - a.id;
                  })
                  .map((g) => (
                    <button
                      ref={g.id === lowerGradeId ? selectedGradeRef : null}
                      key={g.id}
                      type='button'
                      className={cn(
                        designContract.typography.menuItem,
                        'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors',
                        g.id === lowerGradeId
                          ? 'bg-brand/12 font-semibold text-slate-100'
                          : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
                      )}
                      onClick={() => {
                        setLowerGradeId(g.id);
                        setLowerGradeText(
                          g.id === 0
                            ? 'All'
                            : g.grade?.includes('(')
                              ? g.grade.split('(')[1].replace(')', '')
                              : (g.grade ?? ''),
                        );
                        setIsFilterOpen(false);
                        setTimeout(refetch, 10);
                      }}
                    >
                      {g.id === 0 ? 'All' : g.grade} {g.id === lowerGradeId && <Check size={14} />}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <FilterButton active={activityTypeFa} onClick={() => handleFilterToggle('fa')} icon={Plus} label='FA' />
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

      {embedded ? (
        <div className='border-surface-border/45 bg-surface-nav/20 divide-y divide-white/5 overflow-hidden rounded-xl border'>
          {isPending
            ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} />)
            : activity?.map((a) => (
                <ActivityItem
                  key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                  a={a}
                  isBouldering={meta.isBouldering}
                />
              ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  label: string;
};

const activityChipBase =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 transition-colors duration-200 active:scale-95';
const activityChipIdle =
  'bg-surface-nav/45 border-surface-border text-slate-300 hover:bg-surface-nav hover:text-slate-100';
const activityChipActive = 'bg-surface-hover/85 border-white/18 text-slate-100 shadow-sm';

const FilterButton = ({ active, onClick, icon: Icon, label }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(activityChipBase, active ? activityChipActive : activityChipIdle)}
    aria-pressed={active}
    type='button'
  >
    <Icon
      size={12}
      strokeWidth={2}
      className={cn(
        active && label === 'FA' && designContract.activityColors.filter.fa,
        active && label === 'Ticks' && designContract.activityColors.filter.ticks,
        active && label === 'Media' && designContract.activityColors.filter.media,
        active && label === 'Com' && designContract.activityColors.filter.comments,
        !active && 'text-slate-500',
      )}
    />
    <span className={cn(designContract.typography.uiCompact, active ? 'text-slate-100' : 'text-slate-400')}>
      {label}
    </span>
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
    if (a.users) return <Plus size={8} className={designContract.activityColors.status.fa} />;
    if (a.message) return <MessageSquare size={8} className={designContract.activityColors.status.comments} />;
    if (a.media && !a.name) return <Camera size={8} className={designContract.activityColors.status.media} />;
    return <Check size={8} className={designContract.activityColors.status.ticks} />;
  })();

  const [numImg, numMov] = (a.media ?? []).reduce(
    (acc: number[], item) => (item.movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
    [0, 0],
  );

  return (
    <div className='group px-4 py-3 transition-colors hover:bg-white/1.5'>
      <div className='flex items-start gap-3 sm:gap-4'>
        <div className='shrink-0 pt-0.5'>
          <AvatarGroup items={avatarItems} size='tiny' statusIcon={statusIcon} max={2} />
        </div>

        <div className='min-w-0 flex-1'>
          <div
            className={cn(
              designContract.typography.body,
              'min-w-0 leading-relaxed text-pretty [overflow-wrap:anywhere] text-slate-300',
            )}
          >
            {a.users && a.users.length > 0 && !a.repeat ? (
              <>
                <span className={cn(designContract.typography.listEmphasis, 'text-slate-100')}>
                  New {isBouldering ? 'boulder' : 'route'}
                </span>{' '}
                <span className='text-slate-400'>in</span> <ProblemLink a={a} />
              </>
            ) : a.message ? (
              <>
                <Link
                  to={`/user/${a.id}`}
                  className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}
                >
                  {a.name}
                </Link>{' '}
                <span className='text-slate-400'>commented on</span> <ProblemLink a={a} />
              </>
            ) : (
              <>
                {a.name ? (
                  <>
                    <Link
                      to={`/user/${a.id}`}
                      className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}
                    >
                      {a.name}
                    </Link>{' '}
                    <span className='text-slate-400'>{a.repeat ? 'repeated' : 'ticked'}</span>{' '}
                  </>
                ) : numImg > 0 || numMov > 0 ? (
                  <>
                    <span className={cn(designContract.typography.listEmphasis, 'text-slate-100')}>
                      {numImg > 0 && `${numImg} ${numImg === 1 ? 'image' : 'images'}`}
                      {numImg > 0 && numMov > 0 && ' & '}
                      {numMov > 0 && `${numMov} ${numMov === 1 ? 'video' : 'videos'}`}
                    </span>{' '}
                    <span className='text-slate-400'>on</span>{' '}
                  </>
                ) : null}
                <ProblemLink a={a} />
              </>
            )}
            <span
              className={cn(
                designContract.typography.meta,
                'ml-1.5 inline-block font-normal text-slate-500 tabular-nums transition-colors select-none group-hover:text-slate-400',
              )}
            >
              {a.timeAgo}
            </span>
          </div>

          {(a.description || a.message) && (
            <div
              className={cn(
                designContract.typography.meta,
                'mt-1.5 border-l border-white/10 pl-3 leading-relaxed text-slate-400',
              )}
            >
              {a.message ? <Linkify>{a.message}</Linkify> : a.description}
            </div>
          )}

          {a.stars !== undefined && a.stars !== -1 && (
            <div className='mt-1 origin-left opacity-70'>
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
                <Link key={u.id} to={`/user/${u.id}`} className='group/user flex items-center gap-1.5'>
                  <Avatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='mini'
                    className='group-hover/user:ring-brand/50 ring-1 ring-white/10 transition-all'
                  />
                  <span
                    className={cn(
                      designContract.typography.meta,
                      'font-medium text-slate-300 transition-colors group-hover/user:text-slate-200',
                    )}
                  >
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
