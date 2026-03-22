import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../widgets/widgets';

export const ProblemLink = ({ a }: { a: components['schemas']['Activity'] }) => (
  <div className='inline flex-wrap items-center gap-1 text-sm'>
    <span className='text-slate-400 text-[85%] uppercase tracking-tight font-bold'>
      <Link to={`/area/${a.areaId}`} className='hover:text-slate-200 transition-colors'>
        {a.areaName}
      </Link>
      <LockSymbol lockedAdmin={a.areaLockedAdmin} lockedSuperadmin={a.areaLockedSuperadmin} />
      <span className='mx-1 opacity-30'>/</span>
      <Link to={`/sector/${a.sectorId}`} className='hover:text-slate-200 transition-colors'>
        {a.sectorName}
      </Link>
      <LockSymbol lockedAdmin={a.sectorLockedAdmin} lockedSuperadmin={a.sectorLockedSuperadmin} />
      <span className='mx-1 opacity-30'>/</span>
    </span>
    <Link
      to={`/problem/${a.problemId}`}
      className='font-bold text-slate-200 hover:text-brand transition-colors'
    >
      {a.problemName}
    </Link>
    {a.grade && a.grade !== '.' && (
      <span className='ml-1 text-slate-500 font-bold tabular-nums text-[90%]'>{a.grade}</span>
    )}
    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='ml-2 px-1.5 py-0.5 rounded bg-surface-hover border border-surface-border text-[10px] text-slate-500 uppercase font-black'>
        {a.problemSubtype}
      </span>
    )}
    <LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} />
  </div>
);
