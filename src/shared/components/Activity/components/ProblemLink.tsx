import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';
import { ProfileRowTextSep } from '../../Profile/ProfileRowTextSep';
import { tickCragLink, tickFlags, tickProblemLink } from '../../Profile/profileRowTypography';
import { cn } from '../../../../lib/utils';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
  /** Activity sentence meta (“in”, “ticked”, …): when set, used alone for optional `type` + subtype so typography matches those words ({@link tickFlags} otherwise). */
  flagsClassName?: string;
  /** Home feed: one step down from pure `slate-50`/`100` so the block sits calmer in the hero. */
  tone?: 'default' | 'soft';
  /** Activity row: tighter margin before lock so “· Today” doesn’t sit in a huge gap. */
  compactEnd?: boolean;
};

/** Home feed: crags de-emphasized so route + grade read first. */
const softCragLink = 'font-normal text-slate-400 antialiased transition-colors hover:text-brand';
/** Stand out from gray crag/meta copy so route names scan on one line (esp. mobile). */
const softProblemLink = 'inline-block font-bold text-white antialiased transition-colors hover:text-brand';
/** Beside problem title: same bright color, lighter weight so the name stays primary. */
const softGradeBesideProblem = 'font-normal text-white antialiased';
const defaultGradeBesideProblem = 'font-normal text-slate-50 antialiased';

/** Same hierarchy as profile ascents / todo: crag → problem + grade + type (no badge box). */
export const ProblemLink = ({ a, type, flagsClassName, tone = 'default', compactEnd = false }: Props) => {
  const crag = tone === 'soft' ? softCragLink : tickCragLink;
  const problem = tone === 'soft' ? softProblemLink : tickProblemLink;
  const gradeBesideProblem = tone === 'soft' ? softGradeBesideProblem : defaultGradeBesideProblem;
  /** One class stack for label-like spans (optional API type, subtype); avoids mixing with {@link tickFlags} in activity rows. */
  const metaSpanClass = flagsClassName ?? tickFlags;
  const showGrade = !!(a.grade && a.grade !== '.');
  const showSubtype = !!(a.problemSubtype && a.problemSubtype !== '.');
  const hasLock = !!(
    a.areaLockedAdmin ||
    a.sectorLockedAdmin ||
    a.problemLockedAdmin ||
    a.areaLockedSuperadmin ||
    a.sectorLockedSuperadmin ||
    a.problemLockedSuperadmin
  );

  return (
    <>
      {type ? <span className={cn(metaSpanClass, 'mr-1.5')}>{type}</span> : null}

      <Link to={`/area/${a.areaId}`} className={crag}>
        {a.areaName?.trim()}
      </Link>

      <ProfileRowTextSep />

      <Link to={`/sector/${a.sectorId}`} className={crag}>
        {a.sectorName?.trim()}
      </Link>

      <ProfileRowTextSep />

      <Link to={`/problem/${a.problemId}`} className={problem}>
        {a.problemName?.trim()}
      </Link>
      {showGrade ? (
        <span className={cn(gradeBesideProblem, 'ml-1 whitespace-nowrap tabular-nums')}>{a.grade}</span>
      ) : null}

      {showSubtype ? (
        <>
          {showGrade ? <ProfileRowTextSep /> : null}
          <span className={cn(metaSpanClass, !showGrade && 'ml-1')}>{a.problemSubtype}</span>
        </>
      ) : null}

      {hasLock ? (
        <span className={cn(compactEnd ? 'ml-1' : 'ml-1.5', 'inline-block align-middle')}>
          <LockSymbol
            lockedAdmin={!!(a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin)}
            lockedSuperadmin={!!(a.areaLockedSuperadmin || a.sectorLockedSuperadmin || a.problemLockedSuperadmin)}
          />
        </span>
      ) : null}
    </>
  );
};
