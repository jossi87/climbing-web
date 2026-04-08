import { LockSymbol } from '../../shared/ui/Indicators';
import { ProfileRowTextSep } from '../../shared/components/Profile/ProfileRowTextSep';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMeta } from '../../shared/components/Meta';
import { useTicks } from '../../api';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import {
  profileRowRootClass,
  tickCrag,
  tickCragLink,
  tickCragLinkArea,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from '../../shared/components/Profile/profileRowTypography';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

const PlaceholderFeed = () => {
  const headlineWidths = ['w-[96%]', 'w-[88%]', 'w-[92%]', 'w-[84%]', 'w-[90%]'] as const;
  const metaWidths = ['w-[58%]', 'w-[46%]', 'w-[52%]', 'w-[40%]', 'w-[50%]'] as const;
  return (
    <div className='animate-pulse'>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={cn(profileRowRootClass, 'space-y-2 py-2 sm:py-2.5')}>
          <div className={cn('skeleton-bar h-3.5 rounded sm:h-4', headlineWidths[i % headlineWidths.length])} />
          <div className={cn('skeleton-bar-muted h-2.5 rounded', metaWidths[i % metaWidths.length])} />
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
    <div className={cn(profileRowRootClass, 'block min-w-0 py-2 text-pretty [overflow-wrap:anywhere] sm:py-2.5')}>
      {t.date ? <span className={cn(tickFlags, 'tabular-nums')}>{t.date} </span> : null}
      {areaId ? (
        <Link to={`/area/${areaId}`} className={tickCragLinkArea}>
          {t.areaName}
        </Link>
      ) : (
        <span className={tickCrag}>{t.areaName}</span>
      )}
      <LockSymbol lockedAdmin={t.areaLockedAdmin} lockedSuperadmin={t.areaLockedSuperadmin} />
      {t.areaLockedAdmin || t.areaLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
      {sectorId ? (
        <Link to={`/sector/${sectorId}`} className={tickCragLink}>
          {t.sectorName}
        </Link>
      ) : (
        <span className={tickCrag}>{t.sectorName}</span>
      )}
      <LockSymbol lockedAdmin={t.sectorLockedAdmin} lockedSuperadmin={t.sectorLockedSuperadmin} />
      {t.sectorLockedAdmin || t.sectorLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
      <Link to={`/problem/${t.problemId}`} className={tickProblemLink}>
        {t.problemName}
      </Link>
      {t.problemGrade ? (
        <span className={cn(tickWhenGrade, 'ml-1 whitespace-nowrap tabular-nums')}>{t.problemGrade}</span>
      ) : null}
      <LockSymbol lockedAdmin={t.problemLockedAdmin} lockedSuperadmin={t.problemLockedSuperadmin} />
      {t.problemLockedAdmin || t.problemLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
      <span className={tickFlags}>{t.name}</span>
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

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 sm:p-6'>
          {!isLoading && (
            <SectionHeader
              title='Ticks'
              icon={CheckCircle}
              subheader={data ? `Page ${currPage} of ${numPages}` : undefined}
            />
          )}

          <div>
            {isLoading ? <PlaceholderFeed /> : null}

            {!isLoading && data
              ? data.ticks.map((t) => <TickRow key={[t.date, t.name, t.problemId].join(' - ')} t={t} />)
              : null}

            {!isLoading && data && data.ticks.length === 0 ? (
              <div className={cn(profileRowRootClass, tickFlags, 'py-6')}>Empty list.</div>
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
                    className={cn(
                      designContract.typography.uiCompact,
                      designContract.surfaces.segmentIdleRaised,
                      'rounded-lg px-3 py-1.5 font-semibold',
                    )}
                  >
                    1
                  </button>
                )}
                {currPage > 2 && (
                  <span className={cn(designContract.typography.uiCompact, 'px-1 text-slate-400')}>…</span>
                )}
                <button
                  type='button'
                  onClick={() => handlePageChange(currPage)}
                  className={cn(
                    designContract.typography.uiCompact,
                    designContract.surfaces.segmentActiveBrandBorder,
                    'rounded-lg px-3 py-1.5 font-semibold shadow-lg',
                  )}
                >
                  {currPage}
                </button>
                {currPage < numPages - 1 && (
                  <span className={cn(designContract.typography.uiCompact, 'px-1 text-slate-400')}>…</span>
                )}
                {currPage < numPages && (
                  <button
                    type='button'
                    onClick={() => handlePageChange(numPages)}
                    className={cn(
                      designContract.typography.uiCompact,
                      designContract.surfaces.segmentIdleRaised,
                      'rounded-lg px-3 py-1.5 font-semibold',
                    )}
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
