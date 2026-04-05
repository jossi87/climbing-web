import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar/Avatar';
import Media from '../../shared/components/Media/Media';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

type Problem = components['schemas']['Problem'];
type User = components['schemas']['User'];
type ProblemTodo = components['schemas']['ProblemTodo'];
type MediaItem = components['schemas']['Media'];
type Meta = { isClimbing: boolean; isIce: boolean };

type Props = {
  data: Problem;
  meta: Meta;
  orderableMedia: MediaItem[];
  carouselMedia: MediaItem[];
};

const rowClass = cn(
  designContract.typography.body,
  'flex min-w-0 flex-col gap-1 text-[13px] leading-normal text-slate-300 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-2 sm:gap-y-1 sm:text-sm',
);

/** Row label (First ascent, etc.) — full width above facts on mobile; inline from sm up. */
const leadClass =
  'block text-[14px] font-medium leading-snug tracking-tight text-slate-50 sm:inline-flex sm:shrink-0 sm:self-start sm:text-sm';

/** One style for every fact in the row (grade, type, date, names) — same size, weight, color. */
const factClass = 'text-[13px] font-normal leading-normal text-slate-300 sm:text-sm';

/**
 * Shared row box for every fact segment so grade, date, icons, and avatar+name share one vertical center
 * (min-h matches micro avatar + one line of body text).
 */
const factSegmentClass = cn(factClass, 'inline-flex min-h-5 items-center');

/** Lucide icons: same box as row text line (12px). */
const factIconClass = 'shrink-0 text-slate-400';

function dateWithCalendar(date: string) {
  return (
    <span className={cn(factSegmentClass, 'gap-1 tabular-nums')}>
      <Calendar size={12} className={factIconClass} strokeWidth={2.25} aria-hidden />
      {date}
    </span>
  );
}

/** Tiny avatar + name; whole control links to profile (no separate avatar interaction). */
function UserFactLink({
  userId,
  name,
  mediaId,
  mediaVersionStamp,
}: {
  userId: number;
  name?: string;
  mediaId?: number;
  mediaVersionStamp?: number;
}) {
  return (
    <Link
      to={`/user/${userId}`}
      className={cn(factSegmentClass, 'max-w-full min-w-0 gap-1 transition-colors hover:text-slate-100')}
    >
      <Avatar
        name={name}
        mediaId={mediaId}
        mediaVersionStamp={mediaVersionStamp}
        size='micro'
        className='shrink-0 ring-1 ring-white/10'
      />
      <span className='min-w-0'>{name}</span>
    </Link>
  );
}

function climberList(users: User[]) {
  if (users.length === 0) return null;
  return (
    <span className='inline-flex min-w-0 flex-wrap content-start items-start gap-x-2 gap-y-1'>
      {users.map((u, i) =>
        u.id != null ? (
          <UserFactLink
            key={u.id ?? i}
            userId={u.id}
            name={u.name}
            mediaId={u.mediaId}
            mediaVersionStamp={u.mediaVersionStamp}
          />
        ) : null,
      )}
    </span>
  );
}

function todoUserList(todos: ProblemTodo[]) {
  const withUser = todos.filter((t) => t.idUser != null);
  if (withUser.length === 0) return null;
  return (
    <span className={cn(factClass, 'min-w-0 [overflow-wrap:anywhere]')}>
      {withUser.map((u, idx) => (
        <span key={u.idUser ?? idx}>
          {idx > 0 ? ', ' : null}
          <Link to={`/user/${u.idUser}`} className='text-slate-300 transition-colors hover:text-slate-100'>
            {u.name}
          </Link>
        </span>
      ))}
    </span>
  );
}

/** Inline ascent rows — no nested panels; dates use the calendar icon. */
export function ProblemAscentOverview({ data, meta, orderableMedia, carouselMedia }: Props) {
  const faAid = data.faAid;
  const aidDesc = (faAid?.description ?? '').trim();
  const aidUsers = faAid?.users ?? [];
  const aidDate = faAid?.dateHr;

  const showAidBlock = !!faAid && (aidDesc.length > 0 || aidUsers.length > 0 || (aidDate != null && aidDate !== ''));

  const freeUsersFromFa = data.fa ?? [];
  const mergedForFree =
    freeUsersFromFa.length > 0 ? freeUsersFromFa : showAidBlock && aidUsers.length > 0 ? [] : (faAid?.users ?? []);

  const freeDate = data.faDateHr || (!showAidBlock ? faAid?.dateHr : undefined);

  const showFreeBlock =
    mergedForFree.length > 0 || !!freeDate || !!data.originalGrade || (meta.isClimbing && !!data.t?.subType);

  const iceParts = [
    data.startingAltitude ? `Alt ${data.startingAltitude}` : null,
    data.aspect ? `Aspect ${data.aspect}` : null,
    data.routeLength ? `Len ${data.routeLength}` : null,
    data.descent ? `Descent ${data.descent}` : null,
  ].filter(Boolean);
  const showIce = meta.isIce && iceParts.length > 0;

  const todoNames = todoUserList(data.todos ?? []);
  const showTodoRow = todoNames != null;

  const triviaText = (data.trivia ?? '').trim();
  const showTriviaBlock = triviaText.length > 0 || (data.triviaMedia?.length ?? 0) > 0;

  if (!showAidBlock && !showFreeBlock && !showIce && !showTodoRow && !showTriviaBlock) return null;

  const freeLead = faAid ? 'First free ascent:' : 'First ascent:';

  /** Keeps grade / type / date / climbers in one wrapping band so they share a line before breaking. */
  function factsBand(children: ReactNode[]) {
    if (children.length === 0) return null;
    return (
      <span className='inline-flex w-full min-w-0 flex-wrap content-start items-start gap-x-2 gap-y-1 sm:flex-1'>
        {children}
      </span>
    );
  }

  const aidRowBody: ReactNode[] = [];
  if (aidDate) {
    aidRowBody.push(dateWithCalendar(aidDate));
  }
  if (aidUsers.length > 0) {
    aidRowBody.push(climberList(aidUsers));
  }

  const freeRowBody: ReactNode[] = [];
  if (data.originalGrade) {
    freeRowBody.push(
      <span key='g' className={cn(factSegmentClass, 'tabular-nums')}>
        {data.originalGrade}
      </span>,
    );
  }
  if (meta.isClimbing && data.t?.subType) {
    freeRowBody.push(
      <span key='t' className={cn(factSegmentClass, 'gap-1')}>
        <Tag size={12} className={factIconClass} strokeWidth={2.25} aria-hidden />
        {data.t.subType}
      </span>,
    );
  }
  if (freeDate) {
    freeRowBody.push(dateWithCalendar(freeDate));
  }
  if (mergedForFree.length > 0) {
    freeRowBody.push(climberList(mergedForFree));
  }

  return (
    <div className='min-w-0 space-y-3 sm:space-y-3.5'>
      {showAidBlock && (
        <div className='space-y-2'>
          <p className={rowClass}>
            <span className={leadClass}>First aid ascent:</span>
            {factsBand(aidRowBody)}
          </p>
          {aidDesc.length > 0 ? (
            <ExpandableMarkdown
              content={faAid!.description!}
              contentClassName='max-w-none text-sm leading-relaxed text-slate-400'
            />
          ) : null}
        </div>
      )}

      {showFreeBlock && (
        <p className={rowClass}>
          <span className={leadClass}>{freeLead}</span>
          {factsBand(freeRowBody)}
        </p>
      )}

      {showIce ? (
        <p className={cn(designContract.typography.body, 'text-[13px] leading-normal sm:text-sm', factClass)}>
          {iceParts.join(' · ')}
        </p>
      ) : null}

      {showTriviaBlock && (
        <p className={rowClass}>
          <span className={leadClass}>Trivia:</span>
          {factsBand([
            <div key='trivia-inline' className='flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5'>
              {triviaText.length > 0 ? (
                <ExpandableMarkdown
                  content={data.trivia!}
                  className='min-w-0'
                  contentClassName={cn(
                    factClass,
                    'max-w-none leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
                  )}
                />
              ) : null}
              {data.triviaMedia && data.triviaMedia.length > 0 ? (
                <div className='w-full min-w-0'>
                  <Media
                    pitches={data.sections}
                    media={data.triviaMedia}
                    orderableMedia={orderableMedia}
                    carouselMedia={carouselMedia}
                    optProblemId={null}
                    showLocation={false}
                    triviaTiles
                  />
                </div>
              ) : null}
            </div>,
          ])}
        </p>
      )}

      {showTodoRow ? (
        <p className={rowClass}>
          <span className={leadClass}>Todo:</span>
          {factsBand([todoNames])}
        </p>
      ) : null}
    </div>
  );
}
