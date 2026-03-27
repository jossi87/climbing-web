import { LockSymbol } from '../../shared/ui/Indicators';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMeta } from '../../shared/components/Meta';
import { useTicks } from '../../api';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import type { components } from '../../@types/buldreinfo/swagger';

const PlaceholderFeed = () => {
  return (
    <div className='animate-pulse space-y-4'>
      <div className='mb-6 flex items-start gap-4'>
        <div className='bg-surface-nav/50 h-11 w-11 rounded-lg' />
        <div className='space-y-2 pt-0.5'>
          <div className='bg-surface-nav/45 h-5 w-40 rounded-md' />
          <div className='bg-surface-nav/35 h-3 w-24 rounded-md' />
        </div>
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className='space-y-1 rounded-lg py-1'>
          <div className='bg-surface-nav/40 h-3 w-[92%] rounded' />
          <div className='bg-surface-nav/30 h-3 w-[74%] rounded' />
        </div>
      ))}
    </div>
  );
};

type PublicAscent = components['schemas']['PublicAscent'];

const TickRow = ({ t }: { t: PublicAscent }) => {
  const areaId = t.areaId;
  const sectorId = t.sectorId;

  return (
    <div className='block py-1.5 text-[11px] leading-relaxed break-words text-slate-300 sm:text-[12px]'>
      {t.date ? <span className='text-slate-400'>{t.date} </span> : null}
      {areaId ? (
        <Link to={`/area/${areaId}`} className='hover:text-brand transition-colors'>
          {t.areaName}
        </Link>
      ) : (
        <span>{t.areaName}</span>
      )}
      <LockSymbol lockedAdmin={t.areaLockedAdmin} lockedSuperadmin={t.areaLockedSuperadmin} />
      <span className='text-slate-500'> · </span>
      {sectorId ? (
        <Link to={`/sector/${sectorId}`} className='hover:text-brand transition-colors'>
          {t.sectorName}
        </Link>
      ) : (
        <span>{t.sectorName}</span>
      )}
      <LockSymbol lockedAdmin={t.sectorLockedAdmin} lockedSuperadmin={t.sectorLockedSuperadmin} />
      <span className='text-slate-500'> · </span>
      <Link to={`/problem/${t.problemId}`} className='hover:text-brand text-slate-100 transition-colors'>
        {t.problemName}
      </Link>
      <span className='ml-1 text-slate-300'>{t.problemGrade}</span>
      <LockSymbol lockedAdmin={t.problemLockedAdmin} lockedSuperadmin={t.problemLockedSuperadmin} />
      <span className='text-slate-500'> · </span>
      <span className='text-slate-400'>{t.name}</span>
    </div>
  );
};

const Ticks = () => {
  const { page } = useParams();
  const meta = useMeta();
  const pageNum = Number(page ?? 0);
  const { data, isLoading } = useTicks(pageNum);
  const navigate = useNavigate();
  const currPage = Number(data?.currPage ?? 1);
  const numPages = Number(data?.numPages ?? 1);

  const handlePageChange = (newPage: number) => {
    const target = Math.max(1, Math.min(numPages, newPage));
    navigate('/ticks/' + target);
  };

  return (
    <div className='space-y-6'>
      <title>{`Ticks | ${meta?.title}`}</title>

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='p-4 sm:p-6'>
          {!isLoading && (
            <SectionHeader
              title='Public ascents'
              icon={CheckCircle}
              subheader={data ? `Page ${currPage} of ${numPages}` : undefined}
            />
          )}

          <div>
            {isLoading ? <PlaceholderFeed /> : null}

            {!isLoading &&
              data &&
              data.ticks.map((t) => <TickRow key={[t.date, t.name, t.problemId].join(' - ')} t={t} />)}

            {!isLoading && data && data.ticks.length === 0 ? (
              <div className='py-6 text-[11px] text-slate-500 sm:text-[12px]'>Empty list.</div>
            ) : null}
          </div>

          {data && numPages > 1 && (
            <div className='mt-6 flex items-center justify-center gap-2'>
              <button
                disabled={currPage <= 1}
                onClick={() => handlePageChange(currPage - 1)}
                className='bg-surface-nav border-surface-border rounded-lg border p-2 opacity-70 transition-all hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30'
              >
                <ChevronLeft size={18} />
              </button>

              <div className='flex items-center gap-1'>
                {currPage > 1 && (
                  <button
                    type='button'
                    onClick={() => handlePageChange(1)}
                    className='bg-surface-nav border-surface-border hover:border-brand/35 hover:text-brand rounded-lg border px-3 py-1.5 text-[11px] leading-none font-semibold opacity-85 transition-colors sm:text-[12px]'
                  >
                    1
                  </button>
                )}
                {currPage > 2 && <span className='px-1 text-[11px] text-slate-600 sm:text-[12px]'>…</span>}
                <button
                  type='button'
                  onClick={() => handlePageChange(currPage)}
                  className='bg-brand shadow-brand/20 rounded-lg px-3 py-1.5 text-[11px] leading-none font-semibold text-slate-950 shadow-lg sm:text-[12px]'
                >
                  {currPage}
                </button>
                {currPage < numPages - 1 && <span className='px-1 text-[11px] text-slate-600 sm:text-[12px]'>…</span>}
                {currPage < numPages && (
                  <button
                    type='button'
                    onClick={() => handlePageChange(numPages)}
                    className='bg-surface-nav border-surface-border hover:border-brand/35 hover:text-brand rounded-lg border px-3 py-1.5 text-[11px] leading-none font-semibold opacity-85 transition-colors sm:text-[12px]'
                  >
                    {numPages}
                  </button>
                )}
              </div>

              <button
                disabled={currPage >= numPages}
                onClick={() => handlePageChange(currPage + 1)}
                className='bg-surface-nav border-surface-border rounded-lg border p-2 opacity-70 transition-all hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30'
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Ticks;
