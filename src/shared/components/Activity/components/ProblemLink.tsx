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

const softCragLink = 'font-normal text-slate-200 antialiased transition-colors hover:text-brand';
const softProblemLink = 'font-medium text-slate-100 antialiased transition-colors hover:text-brand';
const softWhenGrade = 'font-normal text-slate-300 antialiased';

/** Same hierarchy as profile ascents / todo: crag → problem + grade + type (no badge box). */
export const ProblemLink = ({ a, type, flagsClassName, tone = 'default' }: Props) => {
  const crag = tone === 'soft' ? softCragLink : tickCragLink;
  const problem = tone === 'soft' ? softProblemLink : tickProblemLink;
  const grade = tone === 'soft' ? softWhenGrade : tickWhenGrade;

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

      {a.grade && a.grade !== '.' ? (
        <span className={cn(grade, 'ml-1 whitespace-nowrap tabular-nums')}>{a.grade}</span>
      ) : null}

      {a.problemSubtype && a.problemSubtype !== '.' ? (
        <span className={cn(tickFlags, 'ml-1', flagsClassName)}>{a.problemSubtype}</span>
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
