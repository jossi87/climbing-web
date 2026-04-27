import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';
import { ProfileRowTextSep } from '../../Profile/ProfileRowTextSep';
import { tickCragLinkArea, tickCragLinkSector, tickFlags, tickProblemLink } from '../../Profile/profileRowTypography';
import { designContract } from '../../../../design/contract';
import { cn } from '../../../../lib/utils';
import { TradGearMarker } from '../../../ui/TradGearMarker';
import { climbingRouteUsesPassiveGear, formatRouteTypeLabel } from '../../../../utils/routeTradGear';
import { NO_PERSONAL_GRADE_LABEL, NoPersonalGradeBadge } from '../../../ui/NoPersonalGradeBadge';

const feed = designContract.typography.feed;

/** Middle dot + spaces as plain inline text (one baseline, no `inline-block` box). */
function FeedRowSep({ soft }: { soft: boolean }) {
  if (soft) {
    return (
      <span className={feed.metaSep} aria-hidden>
        {' · '}
      </span>
    );
  }
  return <ProfileRowTextSep />;
}

type Props = {
  a: components['schemas']['Activity'];
  /** Optional label (e.g. API type); after **grade**, middle-dot separated, same type as grade. */
  type?: string;
  /** Activity sentence meta (“in”, “ticked”, …): when set, used for glue words + trailing type/subtype ({@link tickFlags} otherwise). */
  flagsClassName?: string;
  /** Home feed: one step down from pure `slate-50`/`100` so the block sits calmer in the hero. */
  tone?: 'default' | 'soft';
  /** Activity row: tighter margin before lock so “· Today” doesn’t sit in a huge gap. */
  compactEnd?: boolean;
  /** Activity feed (soft tone): **problem + grade · type/subtype**, then `in`, then area · sector (`FeedRowSep` middle dots). */
  problemFirst?: boolean;
};

/** Activity feed — see {@link designContract.typography.feed}. */
const softCragLink = cn(feed.locationLink, 'inline');
const softProblemLink = cn(feed.routeTitle, 'inline');
const softGradeBesideProblem = feed.gradeHighlight;
const defaultGradeBesideProblem = 'font-normal text-slate-50 antialiased';

/** Extra vertical padding on coarse pointers — helps 44px min touch target without shifting desktop layout. */
const feedLinkTouch = 'touch-manipulation py-1.5 -my-1.5 max-md:py-2 max-md:-my-2 md:py-0 md:my-0';

/** Default: crag → problem + grade · type/subtype; with soft + problemFirst, that block then `in` → location. */
export const ProblemLink = ({
  a,
  type,
  flagsClassName,
  tone = 'default',
  compactEnd = false,
  problemFirst = false,
}: Props) => {
  const cragArea = tone === 'soft' ? softCragLink : tickCragLinkArea;
  const cragSector = tone === 'soft' ? softCragLink : tickCragLinkSector;
  const problem = tone === 'soft' ? softProblemLink : tickProblemLink;
  const gradeBesideProblem = tone === 'soft' ? softGradeBesideProblem : defaultGradeBesideProblem;
  /** One class stack for label-like spans (optional API type, subtype); avoids mixing with {@link tickFlags} in activity rows. */
  const metaSpanClass = flagsClassName ?? tickFlags;
  const isNoPersonalGrade = a.grade === NO_PERSONAL_GRADE_LABEL;
  /** Backend echoes `'No personal grade'` in the grade slot for ungraded ticks; render a calmer badge instead of the prominent grade highlight. */
  const showGrade = !!(a.grade && a.grade !== '.' && !isNoPersonalGrade);
  const showSubtype = !!(a.problemSubtype && a.problemSubtype !== '.');
  const subtypeForLabel = showSubtype ? a.problemSubtype : '';
  const routeTypeLabel = formatRouteTypeLabel(type, subtypeForLabel);
  const showPassiveGearIcon = climbingRouteUsesPassiveGear(routeTypeLabel);
  const hasLock = !!(
    a.areaLockedAdmin ||
    a.sectorLockedAdmin ||
    a.problemLockedAdmin ||
    a.areaLockedSuperadmin ||
    a.sectorLockedSuperadmin ||
    a.problemLockedSuperadmin
  );

  const soft = tone === 'soft';

  const locationPair = (
    <>
      <Link to={`/area/${a.areaId}`} className={cn(cragArea, feedLinkTouch)}>
        {a.areaName?.trim()}
      </Link>
      <FeedRowSep soft={soft} />
      <Link to={`/sector/${a.sectorId}`} className={cn(cragSector, feedLinkTouch)}>
        {a.sectorName?.trim()}
      </Link>
    </>
  );

  /** Same classes as the grade span (second read after the problem title). */
  const typeBesideGrade = gradeBesideProblem;

  const routeWithGrade = (
    <>
      <Link
        to={`/problem/${a.problemId}`}
        className={cn(problem, feedLinkTouch, '[overflow-wrap:anywhere] break-words')}
      >
        {a.problemName?.trim()}
      </Link>
      {showGrade ? <span className={cn(gradeBesideProblem, 'ml-1 whitespace-nowrap')}>{a.grade}</span> : null}
      {isNoPersonalGrade ? <NoPersonalGradeBadge variant='feed' className='ml-1' /> : null}
      {showPassiveGearIcon ? (
        <TradGearMarker
          line={routeTypeLabel}
          className={cn(typeBesideGrade, problemFirst && tone === 'soft' && 'trad-gear-marker-wrap--activity-feed')}
          iconClassName={tone === 'soft' && !problemFirst ? 'opacity-85 light:opacity-100' : undefined}
        />
      ) : null}
    </>
  );

  const useProblemFirst = tone === 'soft' && problemFirst;

  const lockBlock = hasLock ? (
    <span className={cn(compactEnd ? 'ml-1' : 'ml-1.5', 'inline')}>
      <LockSymbol
        lockedAdmin={!!(a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin)}
        lockedSuperadmin={!!(a.areaLockedSuperadmin || a.sectorLockedSuperadmin || a.problemLockedSuperadmin)}
      />
    </span>
  ) : null;

  /** Inline phrasing — one typographic baseline (like a written line). */
  return (
    <>
      {useProblemFirst ? (
        <>
          {routeWithGrade}
          <span className={cn(metaSpanClass, 'ms-1.5')}>in</span> {locationPair}
        </>
      ) : (
        <>
          {locationPair}
          <FeedRowSep soft={soft} />
          {routeWithGrade}
        </>
      )}
      {lockBlock}
    </>
  );
};
