import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../widgets/widgets';

export const ProblemLink = ({ a }: { a: components['schemas']['Activity'] }) => (
  <div className='inline flex-wrap items-baseline'>
    <span className='text-slate-500 text-[10px] uppercase tracking-wider font-medium mr-1.5'>
      <Link to={`/area/${a.areaId}`} className='hover:text-slate-300 transition-colors'>
        {a.areaName}
      </Link>
      <LockSymbol lockedAdmin={a.areaLockedAdmin} lockedSuperadmin={a.areaLockedSuperadmin} />
      <span className='mx-1.5 text-slate-600'>/</span>
      <Link to={`/sector/${a.sectorId}`} className='hover:text-slate-300 transition-colors'>
        {a.sectorName}
      </Link>
      <LockSymbol lockedAdmin={a.sectorLockedAdmin} lockedSuperadmin={a.sectorLockedSuperadmin} />
      <span className='ml-1.5 text-slate-600'>/</span>
    </span>
    <Link
      to={`/problem/${a.problemId}`}
      className='font-semibold text-slate-200 text-[13px] hover:text-brand transition-colors'
    >
      {a.problemName}
    </Link>
    {a.grade && a.grade !== '.' && (
      <span className='ml-1.5 text-slate-400 font-bold tabular-nums text-[13px]'>{a.grade}</span>
    )}
    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='ml-2 px-1.5 py-0.5 rounded bg-surface-hover border border-surface-border text-[9px] text-slate-500 uppercase font-bold'>
        {a.problemSubtype}
      </span>
    )}
    <LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} />
  </div>
);
