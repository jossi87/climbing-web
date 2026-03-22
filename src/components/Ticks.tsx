import { LockSymbol } from './common/widgets/widgets';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMeta } from './common/meta';
import { useTicks } from '../api';
import { HeaderButtons } from './common/HeaderButtons';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PlaceholderFeed = () => {
  return (
    <div className='space-y-4 animate-pulse'>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className='h-12 bg-surface-nav/40 rounded-lg w-full' />
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

      <div className='bg-surface-card border border-surface-border rounded-xl p-4 sm:p-6 shadow-sm'>
        <HeaderButtons header='Public ascents' icon='checkmark' />

        <div className='mt-6 divide-y divide-surface-border'>
          {isLoading && <PlaceholderFeed />}

          {data &&
            data.ticks.map((t) => (
              <Link
                key={[t.date, t.name].join(' - ')}
                to={`/problem/${t.problemId}`}
                className='block group py-4 hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg'
              >
                <div className='flex flex-col gap-1'>
                  <div className='flex flex-wrap items-center gap-x-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                    <span className='text-slate-400'>{t.date}</span>
                    <span className='text-slate-600'>/</span>
                    <span className='group-hover:text-slate-300 transition-colors'>
                      {t.areaName}
                    </span>
                    <LockSymbol
                      lockedAdmin={t.areaLockedAdmin}
                      lockedSuperadmin={t.areaLockedSuperadmin}
                    />
                    <span className='text-slate-600'>/</span>
                    <span className='group-hover:text-slate-300 transition-colors'>
                      {t.sectorName}
                    </span>
                    <LockSymbol
                      lockedAdmin={t.sectorLockedAdmin}
                      lockedSuperadmin={t.sectorLockedSuperadmin}
                    />
                    <span className='text-slate-600'>/</span>
                    <span className='group-hover:text-slate-300 transition-colors'>
                      {t.problemName}
                    </span>
                    <LockSymbol
                      lockedAdmin={t.problemLockedAdmin}
                      lockedSuperadmin={t.problemLockedSuperadmin}
                    />
                  </div>

                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-white group-hover:text-brand transition-colors'>
                      {t.name}
                    </span>
                    <span className='text-xs font-mono text-slate-400'>{t.problemGrade}</span>
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
              className='p-2 bg-surface-nav border border-surface-border rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
            >
              <ChevronLeft size={18} />
            </button>

            <div className='flex items-center gap-1'>
              <span className='text-xs font-bold text-white px-3 py-1.5 bg-brand rounded-lg shadow-lg shadow-brand/20'>
                {data.currPage}
              </span>
              <span className='text-xs font-bold text-slate-500 px-2'>of</span>
              <span className='text-xs font-bold text-slate-300 px-3 py-1.5 bg-surface-nav border border-surface-border rounded-lg'>
                {data.numPages}
              </span>
            </div>

            <button
              disabled={Number(data.currPage) >= data.numPages}
              onClick={() => handlePageChange(Number(data.currPage) + 1)}
              className='p-2 bg-surface-nav border border-surface-border rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
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
