import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { profileRowMiddleDotClass } from '../Profile/ProfileRowTextSep';
import { ProblemLink } from './components/ProblemLink';

type ActivitySchema = components['schemas']['Activity'];

type ActivityLayoutDensity = 'default' | 'frontpage';

/** One summary line: story + flex `gap-x` + middot + time — gap is identical on both sides of ·. Kept out of Prettier’s path (see `.prettierignore`) so `</ProblemLink></>` stays tight (no phantom space before ·). */
export function ActivityFeedMetaRow({
  a,
  activityRowRootClass,
  actionClass,
  cragLeadClass,
  isBouldering,
  problemLinkTone,
  userLinkClass,
  layoutDensity = 'default',
}: {
  a: ActivitySchema;
  activityRowRootClass: string;
  actionClass: string;
  cragLeadClass: string;
  isBouldering: boolean;
  problemLinkTone: 'default' | 'soft';
  userLinkClass: string;
  layoutDensity?: ActivityLayoutDensity;
}) {
  const [numImg, numMov] = (a.media ?? []).reduce(
    (acc: number[], item) => (item.movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
    [0, 0],
  );

  const newFaUsers = a.users && a.users.length > 0 && !a.repeat ? a.users : null;

  const story = newFaUsers ? (
      <>
        <span className={cragLeadClass}>New {isBouldering ? 'boulder' : 'route'}</span>{' '}
        <span className={actionClass}>by</span>{' '}
        {newFaUsers.map((u, i) => (
          <Fragment key={u.id}>
            {i > 0 ? (i === newFaUsers.length - 1 ? ' and ' : ', ') : null}
            <Link to={`/user/${u.id}`} className={userLinkClass}>
              {u.name}
            </Link>
          </Fragment>
        ))}
        {' '}
        <span className={actionClass}>in</span>{' '}
        <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} /></>
    ) : a.message ? (
      <>
        <Link to={`/user/${a.id}`} className={userLinkClass}>
          {a.name}
        </Link>{' '}
        <span className={actionClass}>commented on</span>{' '}
        <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} /></>
    ) : (
      <>
        {a.name ? (
          <>
            <Link to={`/user/${a.id}`} className={userLinkClass}>
              {a.name}
            </Link>{' '}
            <span className={actionClass}>{a.repeat ? 'repeated' : 'ticked'}</span>{' '}
          </>
        ) : numImg > 0 || numMov > 0 ? (
          <>
            <span className={cragLeadClass}>
              {numImg > 0 && `${numImg} ${numImg === 1 ? 'image' : 'images'}`}
              {numImg > 0 && numMov > 0 && ' & '}
              {numMov > 0 && `${numMov} ${numMov === 1 ? 'video' : 'videos'}`}
            </span>{' '}
            <span className={actionClass}>on</span>{' '}
          </>
        ) : null}
        <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} /></>
    );

  if (layoutDensity === 'frontpage') {
    const timeClass =
      'shrink-0 text-[11px] leading-none whitespace-nowrap tabular-nums tracking-tight text-slate-500 md:text-[12px] md:text-slate-400';
    return (
      <div className={cn(activityRowRootClass, 'text-pretty [overflow-wrap:anywhere]')}>
        <div className='flex min-w-0 flex-row items-start justify-between gap-2 sm:gap-3 md:gap-4'>
          <div className='min-w-0 flex-1'>
            <div className='inline-flex max-w-full min-w-0 flex-wrap items-baseline gap-x-[0.3em]'>
              {story}
            </div>
          </div>
          <span className={cn(timeClass, 'self-start text-right max-md:leading-snug')}>{a.timeAgo}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        activityRowRootClass,
        'inline-flex max-w-full min-w-0 flex-wrap items-baseline gap-x-[0.3em] text-pretty [overflow-wrap:anywhere]',
      )}
    >
      {[
        <span key='activity-story' className='min-w-0'>{story}</span>,
        <span key='activity-dot' aria-hidden className={cn(profileRowMiddleDotClass, 'shrink-0')}>·</span>,
        <span key='activity-when' className={cn(actionClass, 'shrink-0 whitespace-nowrap')}>{a.timeAgo}</span>,
      ]}
    </div>
  );
}
