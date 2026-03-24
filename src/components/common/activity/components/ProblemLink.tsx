import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../widgets/widgets';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
};

export const ProblemLink = ({ a, type }: Props) => (
  <>
    {type && <span className='text-slate-400 mr-1.5'>{type}</span>}

    <Link
      to={`/area/${a.areaId}`}
      className='text-slate-400 hover:text-slate-200 transition-colors'
    >
      {a.areaName}
    </Link>

    <span className='text-slate-500 px-1 select-none font-medium'>/</span>

    <Link
      to={`/sector/${a.sectorId}`}
      className='text-slate-400 hover:text-slate-200 transition-colors'
    >
      {a.sectorName}
    </Link>

    <span className='text-slate-500 px-1 select-none font-medium'>/</span>

    <Link
      to={`/problem/${a.problemId}`}
      className='font-bold text-slate-200 hover:text-brand transition-colors text-[14px] tracking-tight'
    >
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' && (
      <span className='text-slate-400 font-bold tabular-nums text-[13px] ml-1.5'>{a.grade}</span>
    )}

    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='ml-1.5 inline-block px-1.5 py-0 rounded-sm bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-tight align-middle leading-none'>
        {a.problemSubtype}
      </span>
    )}

    <span className='inline-block align-middle ml-1.5 opacity-50'>
      <LockSymbol lockedAdmin={a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin} />
    </span>
  </>
);
