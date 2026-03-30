import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';
import { ProfileRowAsterisk } from '../../Profile/ProfileRowAsterisk';
import { tickCragLink, tickFlags, tickProblemLink, tickWhenGrade } from '../../Profile/profileRowTypography';
import { cn } from '../../../../lib/utils';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
};

/** Same hierarchy as profile ascents / todo: crag → problem + grade + type (no badge box). */
export const ProblemLink = ({ a, type }: Props) => (
  <>
    {type ? <span className={cn(tickFlags, 'mr-1.5')}>{type}</span> : null}

    <Link to={`/area/${a.areaId}`} className={tickCragLink}>
      {a.areaName}
    </Link>

    <ProfileRowAsterisk />

    <Link to={`/sector/${a.sectorId}`} className={tickCragLink}>
      {a.sectorName}
    </Link>

    <ProfileRowAsterisk />

    <Link to={`/problem/${a.problemId}`} className={tickProblemLink}>
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' ? (
      <span className={cn(tickWhenGrade, 'ml-1 whitespace-nowrap tabular-nums')}>{a.grade}</span>
    ) : null}

    {a.problemSubtype && a.problemSubtype !== '.' ? (
      <span className={cn(tickFlags, 'ml-1')}>{a.problemSubtype}</span>
    ) : null}

    <span className='ml-1.5 inline-block align-middle'>
      <LockSymbol
        lockedAdmin={!!(a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin)}
        lockedSuperadmin={!!(a.areaLockedSuperadmin || a.sectorLockedSuperadmin || a.problemLockedSuperadmin)}
      />
    </span>
  </>
);
