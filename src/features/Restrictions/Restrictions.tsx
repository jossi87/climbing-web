import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LockSymbol } from '../../shared/ui/Indicators';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import type { Success } from '../../@types/buldreinfo';
import { ShieldOff, Ban } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const Restrictions = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getRestrictions'>>(`/restrictions`);

  const numAreas = useMemo(() => data?.reduce((acc, region) => acc + (region.areas?.length ?? 0), 0) ?? 0, [data]);
  const numSectors = useMemo(
    () =>
      data?.reduce(
        (acc, region) => acc + (region.areas ?? []).reduce((a, area) => a + (area.sectors?.length ?? 0), 0),
        0,
      ) ?? 0,
    [data],
  );

  const description = `${numAreas} area${numAreas !== 1 ? 's' : ''}, ${numSectors} sector${numSectors !== 1 ? 's' : ''}`;

  if (!data) {
    return <Loading />;
  }

  return (
    <div className='w-full min-w-0'>
      <title>{`Restrictions | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader title='Restrictions' icon={ShieldOff} subheader={description} className='mb-4 sm:mb-5' />
        </div>
        <div className='p-4 sm:p-5'>
          <div className='space-y-10'>
            {data.map((region) => (
              <section key={region.id} className='scroll-mt-24'>
                <div className='border-surface-border mb-4 flex items-center gap-3 border-b-2 pb-2'>
                  <h2 className={cn(designContract.typography.title, 'text-slate-100')}>{region.name}</h2>
                </div>

                <div className='space-y-4'>
                  {(region.areas ?? []).map((area) => (
                    <div key={area.id}>
                      <div className='flex items-center gap-2'>
                        {area.accessClosed && <Ban size={14} className='shrink-0 text-red-400' />}
                        <Link
                          to={`/area/${area.id}`}
                          className='hover:text-brand text-sm font-semibold text-slate-200 transition-colors'
                        >
                          {area.name}
                        </Link>
                        <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
                      </div>
                      {(area.accessClosed || area.accessInfo) && (
                        <p className='mt-0.5 text-xs text-slate-400'>{area.accessClosed || area.accessInfo}</p>
                      )}
                      {(area.sectors ?? []).length > 0 && (
                        <div className='mt-1 space-y-0.5'>
                          {(area.sectors ?? []).map((sector) => (
                            <div key={sector.id} className='flex items-center gap-2 pl-5'>
                              {sector.accessClosed && <Ban size={11} className='shrink-0 text-red-400' />}
                              <Link
                                to={`/sector/${sector.id}`}
                                className='hover:text-brand text-xs text-slate-400 transition-colors'
                              >
                                {sector.name}
                              </Link>
                              <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                              {(sector.accessClosed || sector.accessInfo) && (
                                <span className='text-xs text-slate-500'>
                                  {sector.accessClosed || sector.accessInfo}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Restrictions;
