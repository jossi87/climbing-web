import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import {
  type LucideIcon,
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

  type FilterButtonProps = {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    hasChevron?: boolean;
    isAlwaysActive?: boolean;
  };

  const FilterButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    hasChevron,
    isAlwaysActive,
  }: FilterButtonProps) => {
    const isEffectiveActive = isAlwaysActive || active;

    return (
      <button
        onClick={() => {
          onClick();
          if (!hasChevron) setTimeout(refetch, 10);
        }}
        className={cn('btn-glass', isEffectiveActive && 'btn-glass-active')}
      >
        <Icon
          size={14}
          className={cn(
            'transition-colors duration-200',
            isEffectiveActive ? 'text-white' : 'text-slate-600',
          )}
        />
        <span className={cn(hasChevron && 'min-w-17.5 text-left')}>{label}</span>
        {hasChevron && (
          <ChevronDown
            size={12}
            className={cn(
              'ml-auto transition-transform duration-300',
              isFilterOpen && 'rotate-180',
            )}
          />
        )}
      </button>
    );
  };

  return (
    <div className='w-full'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-8 px-1'>
        <h2 className='text-lg font-bold text-white hidden sm:block text-left'>Latest Activity</h2>
        <div className='flex flex-wrap items-center gap-2 ml-auto'>
          <div className='relative' ref={filterRef}>
            <FilterButton
              active={true}
              isAlwaysActive={true}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              icon={Filter}
              label={`Grade: ${lowerGradeText === 'n/a' ? 'ALL' : lowerGradeText}`}
              hasChevron
            />
            {isFilterOpen && (
              <div className='absolute top-full right-0 mt-2 w-52 bg-surface-card border border-surface-border rounded-lg shadow-2xl py-2 z-50 max-h-72 overflow-y-auto'>
                <div className='px-4 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-surface-border/50 mb-1'>
                  Lowest Grade
                </div>
                {meta.grades.map((g) => (
                  <button
                    key={g.id}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between',
                      g.id === lowerGradeId
                        ? 'bg-brand/10 text-brand font-bold'
                        : 'text-slate-400 hover:bg-surface-hover hover:text-slate-200',
                    )}
                    onClick={() => {
                      const cleanText = g.grade.includes('(')
                        ? g.grade.split('(')[1].replace(')', '')
                        : g.grade;
                      setLowerGradeId(g.id);
                      setLowerGradeText(g.id === 0 ? 'ALL' : cleanText);
                      setIsFilterOpen(false);
                      setTimeout(refetch, 10);
                    }}
                  >
                    {g.id === 0 ? 'ALL' : g.grade}
                    {g.id === lowerGradeId && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className='h-4 w-px bg-surface-border mx-1' />
          <FilterButton
            active={activityTypeFa}
            onClick={() => setActivityTypeFa(!activityTypeFa)}
            icon={Plus}
            label='FA'
          />
          <FilterButton
            active={activityTypeTicks}
            onClick={() => setActivityTypeTicks(!activityTypeTicks)}
            icon={Check}
            label='Ticks'
          />
          <FilterButton
            active={activityTypeMedia}
            onClick={() => setActivityTypeMedia(!activityTypeMedia)}
            icon={Camera}
            label='Media'
          />
          <FilterButton
            active={activityTypeComments}
            onClick={() => setActivityTypeComments(!activityTypeComments)}
            icon={MessageSquare}
            label='Com'
          />
        </div>
      </div>

      {isPending ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-24 bg-surface-card border border-surface-border rounded-md animate-pulse'
            />
          ))}
        </div>
      ) : (
        <div className='space-y-3 text-left'>
          {activity?.map((a) => {
            const currentKey = a.activityIds?.join('+') ?? `activity-${a.id ?? 0}`;

            if (a.users) {
              return (
                <div
                  key={currentKey}
                  className='bg-surface-card border border-surface-border rounded-md p-4 group hover:border-brand/30 transition-all'
                >
                  <div className='flex gap-4 items-start'>
                    <div className='shrink-0 mt-1'>
                      {(a.problemRandomMediaId ?? 0) > 0 ? (
                        <img
                          src={getMediaFileUrl(
                            Number(a.problemRandomMediaId),
                            Number(a.problemRandomMediaVersionStamp),
                            false,
                            { minDimension: 40 },
                          )}
                          className='w-10 h-10 rounded-md object-cover border border-surface-border'
                          alt=''
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-md bg-surface-nav border border-surface-border flex items-center justify-center text-slate-500'>
                          <Plus size={20} />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2 text-sm'>
                        <span className='text-slate-300'>
                          New {meta.isBouldering ? 'problem' : 'route'} in <ProblemLink a={a} />
                        </span>
                        <span className='text-[10px] text-slate-600 font-bold uppercase whitespace-nowrap'>
                          {a.timeAgo}
                        </span>
                      </div>
                      {a.description && (
                        <div className='mt-2 text-slate-400 text-sm italic border-l-2 border-surface-border/50 pl-3'>
                          {a.description}
                        </div>
                      )}
                      {a.media && <LazyMedia media={a.media} problemId={a.problemId} />}
                      {a.stars !== undefined && a.stars !== -1 && (
                        <div className='mt-3 flex items-center gap-3'>
                          <Stars numStars={a.stars} includeStarOutlines={true} />
                        </div>
                      )}
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {a.users.map((u) => (
                          <Link
                            key={u.id}
                            to={`/user/${u.id}`}
                            className='inline-flex items-center gap-2 px-2 py-1 rounded bg-surface-hover border border-surface-border hover:border-brand/50 transition-colors text-[11px] text-slate-400'
                          >
                            <ClickableAvatar
                              name={u.name}
                              mediaId={u.mediaId}
                              mediaVersionStamp={u.mediaVersionStamp}
                              size='mini'
                            />
                            {u.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (a.message) {
              return (
                <div
                  key={currentKey}
                  className='bg-surface-card border border-surface-border rounded-md p-4 group hover:border-brand/30 transition-all'
                >
                  <div className='flex gap-4 items-start'>
                    <div className='shrink-0 mt-1'>
                      <ClickableAvatar
                        name={a.name}
                        mediaId={a.mediaId}
                        mediaVersionStamp={a.mediaVersionStamp}
                        size='tiny'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2 text-sm'>
                        <span className='text-slate-300'>
                          <Link
                            to={`/user/${a.id}`}
                            className='font-bold text-white hover:text-brand transition-colors'
                          >
                            {a.name}
                          </Link>{' '}
                          posted a comment on <ProblemLink a={a} />
                        </span>
                        <span className='text-[10px] text-slate-600 font-bold uppercase whitespace-nowrap'>
                          {a.timeAgo}
                        </span>
                      </div>
                      <div className='mt-2 text-slate-400 text-sm border-l-2 border-surface-border/50 pl-3 italic'>
                        <Linkify>{a.message}</Linkify>
                      </div>
                      {a.media && <LazyMedia media={a.media} problemId={a.problemId} />}
                    </div>
                  </div>
                </div>
              );
            }

            const [numImg, numMov] = (a.media ?? []).reduce(
              (acc: number[], { movie }) => (movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
              [0, 0],
            );

            return (
              <div
                key={currentKey}
                className='bg-surface-card border border-surface-border rounded-md p-4 group hover:border-brand/30 transition-all'
              >
                <div className='flex gap-4 items-start'>
                  <div className='shrink-0 mt-1'>
                    {!a.name && (a.problemRandomMediaId ?? 0) > 0 ? (
                      <img
                        src={getMediaFileUrl(
                          Number(a.problemRandomMediaId),
                          Number(a.problemRandomMediaVersionStamp),
                          false,
                          { minDimension: 40 },
                        )}
                        className='w-10 h-10 rounded-md object-cover border border-surface-border'
                        alt=''
                      />
                    ) : (
                      <ClickableAvatar
                        name={a.name}
                        mediaId={a.mediaId}
                        mediaVersionStamp={a.mediaVersionStamp}
                        size='tiny'
                      />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2 text-sm'>
                      <span className='text-slate-300'>
                        {a.name ? (
                          <>
                            <Link
                              to={`/user/${a.id}`}
                              className='font-bold text-white hover:text-brand transition-colors'
                            >
                              {a.name}
                            </Link>{' '}
                            {a.repeat ? 'repeated' : 'ticked'}{' '}
                          </>
                        ) : (
                          <span className='font-bold text-slate-100'>
                            {numImg > 0 && (
                              <>
                                {numImg} new <ImageIcon size={12} className='inline mb-1' />{' '}
                              </>
                            )}
                            {numImg > 0 && numMov > 0 && 'and '}
                            {numMov > 0 && (
                              <>
                                {numMov} new <Film size={12} className='inline mb-1' />{' '}
                              </>
                            )}
                            on{' '}
                          </span>
                        )}
                        <ProblemLink a={a} />
                      </span>
                      <span className='text-[10px] text-slate-600 font-bold uppercase whitespace-nowrap'>
                        {a.timeAgo}
                      </span>
                    </div>
                    {a.description && (
                      <div className='mt-2 text-slate-400 text-sm italic border-l-2 border-surface-border/50 pl-3'>
                        {a.description}
                      </div>
                    )}
                    {a.media && <LazyMedia media={a.media} problemId={a.problemId} />}
                    {a.stars !== undefined && a.stars !== -1 && (
                      <div className='mt-3 flex items-center gap-3'>
                        <Stars numStars={a.stars} includeStarOutlines={true} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activity;
