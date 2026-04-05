import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { ProblemLink } from './components/ProblemLink';

type ActivitySchema = components['schemas']['Activity'];

/** One summary line: story + time on the right (same layout site-wide — home, area, sector). */
export function ActivityFeedMetaRow({
  a,
  activityRowRootClass,
  actionClass,
  cragLeadClass,
  isBouldering,
  problemLinkTone,
  userLinkClass,
}: {
  a: ActivitySchema;
  activityRowRootClass: string;
  actionClass: string;
  cragLeadClass: string;
  isBouldering: boolean;
  problemLinkTone: 'default' | 'soft';
  userLinkClass: string;
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
      <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} />
    </>
  ) : a.message ? (
    <>
      <Link to={`/user/${a.id}`} className={userLinkClass}>
        {a.name}
      </Link>{' '}
      <span className={actionClass}>commented on</span>{' '}
      <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} />
    </>
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
      <ProblemLink a={a} compactEnd flagsClassName={actionClass} tone={problemLinkTone} />
    </>
  );

  const timeClass =
    'shrink-0 text-[11px] leading-none whitespace-nowrap tabular-nums tracking-tight text-slate-400 md:text-[12px]';

  return (
    <div className={cn(activityRowRootClass, 'text-pretty [overflow-wrap:anywhere]')}>
      <div className='flex min-w-0 flex-row items-start justify-between gap-2 sm:gap-3 md:gap-4'>
        <div className='min-w-0 flex-1'>
          {/* Normal inline flow so long route names break mid-line; avoid flex-wrap (whole links jump as one unit). */}
          <div className='min-w-0 max-w-full break-words'>{story}</div>
        </div>
        <span className={cn(timeClass, 'max-md:leading-snug self-start text-right')}>{a.timeAgo}</span>
      </div>
    </div>
  );
}
