import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../widgets/widgets';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
};

export const ProblemLink = ({ a, type }: Props) => (
  <>
    {type && (
      <>
        <span className='text-slate-500 lowercase font-medium'>{type}</span>{' '}
      </>
    )}
    <Link
      to={`/area/${a.areaId}`}
      className='text-slate-500 text-[10px] uppercase tracking-wider font-bold hover:text-slate-300 transition-colors'
    >
      {a.areaName}
    </Link>
    <LockSymbol lockedAdmin={a.areaLockedAdmin} lockedSuperadmin={a.areaLockedSuperadmin} />{' '}
    <span className='text-slate-700 font-black text-[10px]'>/</span>{' '}
    <Link
      to={`/sector/${a.sectorId}`}
      className='text-slate-500 text-[10px] uppercase tracking-wider font-bold hover:text-slate-300 transition-colors'
    >
      {a.sectorName}
    </Link>
    <LockSymbol lockedAdmin={a.sectorLockedAdmin} lockedSuperadmin={a.sectorLockedSuperadmin} />{' '}
    <span className='text-slate-700 font-black text-[10px]'>/</span>{' '}
    <Link
      to={`/problem/${a.problemId}`}
      className='font-bold text-slate-100 hover:text-brand transition-colors text-[14px]'
    >
      {a.problemName}
    </Link>
    {a.grade && a.grade !== '.' && (
      <>
        {' '}
        <span className='text-slate-400 font-black tabular-nums text-[13px]'>{a.grade}</span>
      </>
    )}
    {a.problemSubtype && a.problemSubtype !== '.' && (
      <>
        {' '}
        <span className='px-1 py-0.5 rounded bg-surface-hover border border-surface-border text-[8px] text-slate-500 uppercase font-black tracking-widest align-middle'>
          {a.problemSubtype}
        </span>
      </>
    )}
    <LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} />
  </>
);
