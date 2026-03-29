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
  'flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] leading-normal text-pretty text-slate-300 sm:text-sm',
);

const leadClass = cn(designContract.typography.meta, 'inline-flex shrink-0 items-center text-slate-500');

const dot = (
  <span className='inline-flex items-center text-slate-600 select-none' aria-hidden>
    ·
  </span>
);

function dateWithCalendar(date: string) {
  return (
    <span className='inline-flex items-center gap-1 text-slate-300 tabular-nums'>
      <Calendar size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
      {date}
    </span>
  );
}

function climberList(users: User[]) {
  if (users.length === 0) return null;
  return (
    <span className='inline-flex flex-wrap items-center gap-x-0 gap-y-0.5'>
      {users.map((u, i) => (
        <span key={u.id ?? i} className='inline-flex items-center'>
          {i > 0 ? (
            <span className='inline-flex items-center px-1 text-slate-600 select-none' aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            to={`/user/${u.id}`}
            className='font-medium text-slate-200 underline decoration-white/15 underline-offset-2 transition-colors hover:text-slate-50 hover:decoration-white/30'
          >
            <span className='inline-flex items-center gap-1.5'>
              <ClickableAvatar name={u.name} mediaId={u.mediaId} mediaVersionStamp={u.mediaVersionStamp} size='mini' />
              {u.name}
            </span>
          </Link>
        </span>
      ))}
    </span>
  );
}

function todoUserList(todos: ProblemTodo[]) {
  const withUser = todos.filter((t) => t.idUser != null);
  if (withUser.length === 0) return null;
  return (
    <span className='inline-flex flex-wrap items-center gap-x-0 gap-y-0.5'>
      {withUser.map((u, i) => (
        <span key={u.idUser ?? i} className='inline-flex items-center'>
          {i > 0 ? (
            <span className='inline-flex items-center px-1 text-slate-600 select-none' aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            to={`/user/${u.idUser}`}
            className='font-medium text-slate-200 underline decoration-white/15 underline-offset-2 transition-colors hover:text-slate-50 hover:decoration-white/30'
          >
            <span className='inline-flex items-center gap-1.5'>
              <ClickableAvatar name={u.name} mediaId={u.mediaId} mediaVersionStamp={u.mediaVersionStamp} size='mini' />
              {u.name}
            </span>
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

  const aidRowBody: ReactNode[] = [];
  if (aidDate) {
    aidRowBody.push(dot, dateWithCalendar(aidDate));
  }
  if (aidUsers.length > 0) {
    aidRowBody.push(dot, climberList(aidUsers));
  }

  const freeRowBody: ReactNode[] = [];
  if (data.originalGrade) {
    freeRowBody.push(
      dot,
      <span
        key='g'
        className={cn(designContract.typography.grade, 'inline-flex items-center font-semibold text-slate-100')}
      >
        {data.originalGrade}
      </span>,
    );
  }
  if (meta.isClimbing && data.t?.subType) {
    freeRowBody.push(
      dot,
      <span key='t' className='inline-flex items-center gap-1 text-slate-300'>
        <Tag size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
        {data.t.subType}
      </span>,
    );
  }
  if (freeDate) {
    freeRowBody.push(dot, dateWithCalendar(freeDate));
  }
  if (mergedForFree.length > 0) {
    freeRowBody.push(dot, climberList(mergedForFree));
  }

  return (
    <div className='min-w-0 space-y-3 text-pretty [overflow-wrap:anywhere] sm:space-y-3.5'>
      {showAidBlock && (
        <div className='space-y-2'>
          <p className={rowClass}>
            <span className={leadClass}>First aid ascent</span>
            {aidRowBody}
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
          {freeRowBody}
        </p>
      )}

      {showIce ? <p className={cn(designContract.typography.meta, 'text-slate-400')}>{iceParts.join(' · ')}</p> : null}

      {showTodoRow ? (
        <p className={rowClass}>
          <span className={leadClass}>Todo</span>
          {dot}
          {todoNames}
        </p>
      ) : null}
    </div>
  );
}
