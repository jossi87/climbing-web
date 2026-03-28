import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';
import { designContract } from '../../../../design/contract';
import { cn } from '../../../../lib/utils';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
};

export const ProblemLink = ({ a, type }: Props) => (
  <>
    {type && <span className='mr-1.5 text-slate-400'>{type}</span>}

    <Link to={`/area/${a.areaId}`} className={designContract.typography.listLinkMuted}>
      {a.areaName}
    </Link>

    <span className='px-1 font-medium text-slate-600 select-none'>·</span>

    <Link to={`/sector/${a.sectorId}`} className={designContract.typography.listLinkMuted}>
      {a.sectorName}
    </Link>

    <span className='px-1 font-medium text-slate-600 select-none'>·</span>

    <Link
      to={`/problem/${a.problemId}`}
      className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}
    >
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' && (
      <span className={cn(designContract.typography.meta, 'ml-1 font-mono text-slate-500 tabular-nums')}>
        {a.grade}
      </span>
    )}

    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='badge-micro ml-1.5 py-0.5'>{a.problemSubtype}</span>
    )}

    <span className='ml-1.5 inline-block align-middle opacity-50'>
      <LockSymbol lockedAdmin={a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin} />
    </span>
  </>
);
