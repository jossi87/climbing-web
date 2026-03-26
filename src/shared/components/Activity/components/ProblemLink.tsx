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

    <span className='px-1 font-medium text-slate-500 select-none'>·</span>

    <Link to={`/sector/${a.sectorId}`} className='text-slate-300 transition-colors hover:text-slate-200'>
      {a.sectorName}
    </Link>

    <span className='px-1 font-medium text-slate-500 select-none'>·</span>

    <Link to={`/problem/${a.problemId}`} className='hover:text-brand font-semibold text-slate-200 transition-colors'>
      {a.problemName}
    </Link>

    {a.grade && a.grade !== '.' && <span className='ml-1 text-slate-300'>{a.grade}</span>}

    {a.problemSubtype && a.problemSubtype !== '.' && (
      <span className='ml-1.5 inline-flex rounded border border-white/16 px-1 py-0.5 text-[10px] text-slate-300'>
        {a.problemSubtype}
      </span>
    )}

    <span className='ml-1.5 inline-block align-middle opacity-50'>
      <LockSymbol lockedAdmin={a.areaLockedAdmin || a.sectorLockedAdmin || a.problemLockedAdmin} />
    </span>
  </>
);
