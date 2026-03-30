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
};

/** Same hierarchy as profile ascents / todo: crag → problem + grade + type (no badge box). */
export const ProblemLink = ({ a, type, flagsClassName }: Props) => (
  <>
    {type ? <span className={cn(tickFlags, 'mr-1.5', flagsClassName)}>{type}</span> : null}

    <Link to={`/area/${a.areaId}`} className={tickCragLink}>
      {a.areaName}
    </Link>

    <ProfileRowTextSep />

    <Link to={`/sector/${a.sectorId}`} className={tickCragLink}>
      {a.sectorName}
    </Link>

    <ProfileRowTextSep />

    <Link to={`/problem/${a.problemId}`} className={tickProblemLink}>
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' ? (
      <span className={cn(tickWhenGrade, 'ml-1 whitespace-nowrap tabular-nums')}>{a.grade}</span>
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
