import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { ClickableAvatar } from '../../shared/ui/Avatar/Avatar';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

type Problem = components['schemas']['Problem'];
type User = components['schemas']['User'];
type ProblemTodo = components['schemas']['ProblemTodo'];
type Meta = { isClimbing: boolean; isIce: boolean };

type Props = {
  data: Problem;
  meta: Meta;
  /** When true and `data.todos` is non-empty, show who has this on their todo (same visibility as before). */
  showTodoUsers?: boolean;
};

const rowClass = cn(
  designContract.typography.body,
  'flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-normal text-slate-300 sm:text-sm',
);

/** Row label (First ascent, etc.) — slightly quieter than the facts. */
const leadClass = cn(designContract.typography.meta, 'inline-flex shrink-0 items-baseline text-slate-500');

/** One style for every fact in the row (grade, type, date, names) — same size, weight, color. */
const factClass = 'text-[13px] font-normal leading-normal text-slate-300 sm:text-sm';

/** Lucide icons next to text: nudge so cap height lines up with the fact line. */
const factIconClass = 'shrink-0 text-slate-500 relative top-[0.12em]';

const todoNameSep = (
  <span className='inline-flex items-baseline px-1 text-slate-600 select-none' aria-hidden>
    ·
  </span>
);

function dateWithCalendar(date: string) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 tabular-nums', factClass)}>
      <Calendar size={12} className={factIconClass} strokeWidth={2.25} />
      {date}
    </span>
  );
}

function climberList(users: User[]) {
  if (users.length === 0) return null;
  return (
    <span className='inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1'>
      {users.map((u, i) => (
        <Link
          key={u.id ?? i}
          to={`/user/${u.id}`}
          className={cn(
            factClass,
            'inline-flex max-w-full min-w-0 items-baseline gap-1.5 transition-colors hover:text-slate-100',
          )}
        >
          <ClickableAvatar
            name={u.name}
            mediaId={u.mediaId}
            mediaVersionStamp={u.mediaVersionStamp}
            size='mini'
            className='shrink-0 translate-y-px'
          />
          <span className='min-w-0'>{u.name}</span>
        </Link>
      ))}
    </span>
  );
}

function todoUserList(todos: ProblemTodo[]) {
  const withUser = todos.filter((t) => t.idUser != null);
  if (withUser.length === 0) return null;
  return (
    <span className='inline-flex flex-wrap items-baseline gap-x-0 gap-y-0.5'>
      {withUser.map((u, i) => (
        <span key={u.idUser ?? i} className='inline-flex items-baseline'>
          {i > 0 ? todoNameSep : null}
          <Link to={`/user/${u.idUser}`} className={cn(factClass, 'transition-colors hover:text-slate-100')}>
            {u.name}
          </Link>
        </span>
      ))}
    </span>
  );
}

/** Inline ascent rows — no nested panels; dates use the calendar icon. */
export function ProblemAscentOverview({ data, meta, showTodoUsers }: Props) {
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
  const showTodoRow = !!showTodoUsers && todoNames != null;

  if (!showAidBlock && !showFreeBlock && !showIce && !showTodoRow) return null;

  const freeLead = faAid ? 'First free ascent' : 'First ascent';

  /** Keeps grade / type / date / climbers in one wrapping band so they share a line before breaking. */
  function factsBand(children: ReactNode[]) {
    if (children.length === 0) return null;
    return <span className='inline-flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1'>{children}</span>;
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
      <span key='g' className={cn('tabular-nums', factClass)}>
        {data.originalGrade}
      </span>,
    );
  }
  if (meta.isClimbing && data.t?.subType) {
    freeRowBody.push(
      <span key='t' className={cn('inline-flex items-baseline gap-1', factClass)}>
        <Tag size={12} className={factIconClass} strokeWidth={2.25} />
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
            <span className={leadClass}>First aid ascent</span>
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

      {showTodoRow ? (
        <p className={rowClass}>
          <span className={leadClass}>Todo</span>
          {factsBand([todoNames])}
        </p>
      ) : null}
    </div>
  );
}
