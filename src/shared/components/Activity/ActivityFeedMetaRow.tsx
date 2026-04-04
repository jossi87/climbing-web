import { Link } from 'react-router-dom';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { profileRowMiddleDotClass } from '../Profile/ProfileRowTextSep';
import { ProblemLink } from './components/ProblemLink';

type ActivitySchema = components['schemas']['Activity'];

/** One summary line: story + flex `gap-x` + middot + time — gap is identical on both sides of ·. Kept out of Prettier’s path (see `.prettierignore`) so `</ProblemLink></>` stays tight (no phantom space before ·). */
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

  const story =
    a.users && a.users.length > 0 && !a.repeat ? (
      <>
        <span className={cragLeadClass}>New {isBouldering ? 'boulder' : 'route'}</span>{' '}
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
