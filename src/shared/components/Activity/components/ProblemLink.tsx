import { Link } from 'react-router-dom';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { LockSymbol } from '../../../ui/Indicators';

type Props = {
  a: components['schemas']['Activity'];
  type?: string;
};

export const ProblemLink = ({ a, type }: Props) => (
  <>
    {type && <span className='mr-1.5 text-slate-300'>{type}</span>}

    <Link to={`/area/${a.areaId}`} className='text-slate-300 transition-colors hover:text-slate-200'>
      {a.areaName}
    </Link>

    <span className='px-1 font-medium text-slate-400 select-none'>/</span>

    <Link to={`/sector/${a.sectorId}`} className='text-slate-300 transition-colors hover:text-slate-200'>
      {a.sectorName}
    </Link>

    <span className='px-1 font-medium text-slate-400 select-none'>/</span>

    <Link to={`/problem/${a.problemId}`} className='hover:text-brand font-semibold text-slate-200 transition-colors'>
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' && (
      <span className='ml-1.5 text-sm font-medium text-slate-200 tabular-nums'>{a.grade}</span>
    )}

    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='ml-1.5 inline-block rounded-sm border border-white/10 bg-white/5 px-1.5 py-0 align-middle text-[9px] leading-none font-bold tracking-tight text-slate-300 uppercase'>
        {a.problemSubtype}
      </span>
    )}

    <span className='ml-1.5 inline-block align-middle opacity-50'>
      <LockSymbol lockedAdmin={a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin} />
    </span>
  </>
);
