import { LockSymbol } from '../../shared/ui/Indicators';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMeta } from '../../shared/components/Meta';
import { useTicks } from '../../api';
import { HeaderButtons } from '../../shared/components/HeaderButtons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const PlaceholderFeed = () => {
  return (
    <div className='animate-pulse space-y-4'>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className='bg-surface-nav/40 h-12 w-full rounded-lg' />
      ))}
    </div>
  );
};

const Ticks = () => {
  const { page } = useParams();
  const meta = useMeta();
  const pageNum = Number(page ?? 0);
  const { data, isLoading } = useTicks(pageNum);
  const navigate = useNavigate();

  const handlePageChange = (newPage: number) => {
    navigate('/ticks/' + newPage);
  };

  return (
    <div className='space-y-6'>
      <title>{`Ticks | ${meta?.title}`}</title>

      <div className={cn(designContract.surfaces.card, 'p-4 sm:p-6')}>
        <HeaderButtons header='Public ascents' icon='checkmark' />

        <div className='divide-surface-border mt-6 divide-y'>
          {isLoading && <PlaceholderFeed />}

          {data &&
            data.ticks.map((t) => (
              <Link
                key={[t.date, t.name].join(' - ')}
                to={`/problem/${t.problemId}`}
                className='group -mx-2 block rounded-lg px-2 py-4 transition-colors hover:bg-white/5'
              >
                <div className='flex flex-col gap-1'>
                  <div className='flex flex-wrap items-center gap-x-1.5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase'>
                    <span className='text-slate-400'>{t.date}</span>
                    <span className='text-slate-600'>/</span>
                    <span className='transition-colors group-hover:text-slate-300'>{t.areaName}</span>
                    <LockSymbol lockedAdmin={t.areaLockedAdmin} lockedSuperadmin={t.areaLockedSuperadmin} />
                    <span className='text-slate-600'>/</span>
                    <span className='transition-colors group-hover:text-slate-300'>{t.sectorName}</span>
                    <LockSymbol lockedAdmin={t.sectorLockedAdmin} lockedSuperadmin={t.sectorLockedSuperadmin} />
                    <span className='text-slate-600'>/</span>
                    <span className='transition-colors group-hover:text-slate-300'>{t.problemName}</span>
                    <LockSymbol lockedAdmin={t.problemLockedAdmin} lockedSuperadmin={t.problemLockedSuperadmin} />
                  </div>

                  <div className='flex items-center gap-2'>
                    <span className={cn('type-body group-hover:text-brand font-semibold transition-colors')}>
                      {t.name}
                    </span>
                    <span className='font-mono text-xs text-slate-400'>{t.problemGrade}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {data && data.numPages > 1 && (
          <div className='mt-8 flex items-center justify-center gap-2'>
            <button
              disabled={Number(data.currPage) <= 1}
              onClick={() => handlePageChange(Number(data.currPage) - 1)}
              className='bg-surface-nav border-surface-border rounded-lg border p-2 opacity-70 transition-all hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30'
            >
              <ChevronLeft size={18} />
            </button>

            <div className='flex items-center gap-1'>
              <span className='bg-brand shadow-brand/20 rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg'>
                {data.currPage}
              </span>
              <span className='px-2 text-xs font-bold text-slate-500'>of</span>
              <span className='bg-surface-nav border-surface-border rounded-lg border px-3 py-1.5 text-xs font-bold opacity-85'>
                {data.numPages}
              </span>
            </div>

            <button
              disabled={Number(data.currPage) >= data.numPages}
              onClick={() => handlePageChange(Number(data.currPage) + 1)}
              className='bg-surface-nav border-surface-border rounded-lg border p-2 opacity-70 transition-all hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30'
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticks;
