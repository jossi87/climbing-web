import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';
import { ProfileRowTextSep } from '../../Profile/ProfileRowTextSep';
import { tickCragLink, tickFlags, tickProblemLink, tickWhenGrade } from '../../Profile/profileRowTypography';
import { cn } from '../../../../lib/utils';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
  /** Merges with {@link tickFlags} for type + subtype (e.g. Activity feed: brighter muted text). */
  flagsClassName?: string;
  /** Home feed: one step down from pure `slate-50`/`100` so the block sits calmer in the hero. */
  tone?: 'default' | 'soft';
};

/** Home feed: crags de-emphasized so route + grade read first. */
const softCragLink = 'font-normal text-slate-400 antialiased transition-colors hover:text-brand';
/** Stand out from gray crag/meta copy so route names scan on one line (esp. mobile). */
const softProblemLink = 'inline-block font-bold text-white antialiased transition-colors hover:text-brand';
/** Home feed: grade as secondary metadata, not a loud accent. */
const softWhenGrade = 'font-medium text-slate-300 antialiased';

/** Same hierarchy as profile ascents / todo: crag → problem + grade + type (no badge box). */
export const ProblemLink = ({ a, type, flagsClassName, tone = 'default' }: Props) => {
  const crag = tone === 'soft' ? softCragLink : tickCragLink;
  const problem = tone === 'soft' ? softProblemLink : tickProblemLink;
  const grade = tone === 'soft' ? softWhenGrade : tickWhenGrade;
  const showGrade = !!(a.grade && a.grade !== '.');
  const showSubtype = !!(a.problemSubtype && a.problemSubtype !== '.');

  return (
    <>
      {type ? <span className={cn(tickFlags, 'mr-1.5', flagsClassName)}>{type}</span> : null}

      <Link to={`/area/${a.areaId}`} className={crag}>
        {a.areaName}
      </Link>

      <ProfileRowTextSep />

      <Link to={`/sector/${a.sectorId}`} className={crag}>
        {a.sectorName}
      </Link>

      <ProfileRowTextSep />

      <Link to={`/problem/${a.problemId}`} className={problem}>
        {a.problemName}
      </Link>

      {showGrade ? <span className={cn(grade, 'ml-1 whitespace-nowrap tabular-nums')}>{a.grade}</span> : null}

      {showSubtype ? (
        <>
          {showGrade ? <ProfileRowTextSep /> : null}
          <span className={cn(tickFlags, !showGrade && 'ml-1', flagsClassName)}>{a.problemSubtype}</span>
        </>
      ) : null}

      <span className='ml-1.5 inline-block align-middle'>
        <LockSymbol
          lockedAdmin={!!(a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin)}
          lockedSuperadmin={!!(a.areaLockedSuperadmin || a.sectorLockedSuperadmin || a.problemLockedSuperadmin)}
        />
      </span>
    </>
  );
};
