import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LockSymbol, Stars, SunOnWall, WallDirection } from '../Widgets/Widgets';
import type { components } from '../../../@types/buldreinfo/swagger';
import { ArrowUpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

const JumpToTop = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className='p-1 opacity-70 transition-colors hover:opacity-100'
  >
    <ArrowUpCircle size={16} />
  </button>
);

export type Props = {
  areas: (Required<
    Pick<
      components['schemas']['Area'],
      'id' | 'lockedAdmin' | 'lockedSuperadmin' | 'name' | 'sunFromHour' | 'sunToHour'
    >
  > & {
    sectors: (Required<
      Pick<
        components['schemas']['Sector'],
        | 'id'
        | 'name'
        | 'lockedAdmin'
        | 'lockedSuperadmin'
        | 'wallDirectionCalculated'
        | 'wallDirectionManual'
        | 'sunFromHour'
        | 'sunToHour'
      >
    > &
      Pick<components['schemas']['TocSector'], 'outline' | 'parking'> & {
        problems: (Required<
          Pick<components['schemas']['Problem'], 'id' | 'name' | 'lockedAdmin' | 'lockedSuperadmin' | 'grade' | 'nr'>
        > &
          Pick<components['schemas']['Problem'], 'stars' | 'ticked' | 'todo' | 'coordinates' | 'broken'> & {
            text?: string;
            subText?: string;
          })[];
      })[];
  })[];
  header?: ReactNode;
  subHeader?: ReactNode;
};

export const TableOfContents = ({ areas, header, subHeader }: Props) => {
  const areaRefs = useRef<Record<number, HTMLElement | null>>({});

  if (!areas || areas.length === 0) {
    return <div className='p-8 text-center text-slate-500 italic'>No results match your search criteria.</div>;
  }

  return (
    <div className='space-y-6'>
      {header}

      <div className='bg-surface-nav/30 border-surface-border/50 flex flex-wrap gap-1.5 rounded-xl border p-3'>
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => areaRefs.current[area.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className='bg-surface-nav border-surface-border hover:border-brand/50 type-label flex items-center gap-1.5 rounded-lg border px-2.5 py-1 opacity-80 transition-all hover:opacity-100'
          >
            {area.name}
            <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
          </button>
        ))}
      </div>

      {subHeader}

      <div className='space-y-16'>
        {areas.map((area) => (
          <section
            key={area.id}
            ref={(el) => {
              areaRefs.current[area.id] = el;
            }}
            className='scroll-mt-24'
          >
            <div className='border-surface-border mb-6 flex items-center justify-between border-b-2 pb-3'>
              <div className='flex items-center gap-3'>
                <Link to={`/area/${area.id}`} className='hover:text-brand type-h1 transition-colors'>
                  {area.name}
                </Link>
                <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
                <SunOnWall sunFromHour={area.sunFromHour} sunToHour={area.sunToHour} />
              </div>
              <JumpToTop />
            </div>

            <div className='space-y-10'>
              {area.sectors.map((sector) => (
                <div key={sector.id} className='space-y-4'>
                  <div className='border-surface-border/50 flex items-center justify-between border-b pb-2'>
                    <div className='flex items-center gap-3'>
                      <Link
                        to={`/sector/${sector.id}`}
                        className={cn('hover:text-brand text-xs', designContract.typography.label)}
                      >
                        {sector.name}
                      </Link>
                      <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                    </div>
                    <div className='flex items-center gap-3'>
                      <WallDirection
                        wallDirectionCalculated={sector.wallDirectionCalculated}
                        wallDirectionManual={sector.wallDirectionManual}
                      />
                      <SunOnWall sunFromHour={sector.sunFromHour} sunToHour={sector.sunToHour} />
                    </div>
                  </div>

                  <div className='flex flex-col gap-1'>
                    {sector.problems.map((problem) => (
                      <div
                        key={problem.id}
                        className={cn(
                          'flex gap-4 rounded-lg border border-transparent p-2.5 transition-colors',
                          problem.ticked
                            ? 'border-green-500/10 bg-green-500/5'
                            : problem.todo
                              ? 'border-blue-500/10 bg-blue-500/5'
                              : 'hover:bg-surface-nav/30',
                        )}
                      >
                        <div className='w-6 shrink-0 pt-0.5 font-mono text-[11px] text-slate-500'>#{problem.nr}</div>

                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Link
                              to={`/problem/${problem.id}`}
                              className={cn(
                                'text-[14px] font-bold transition-colors',
                                problem.broken ? 'line-through opacity-70' : 'type-body hover:text-brand',
                              )}
                            >
                              {problem.name}
                            </Link>
                            <span className='font-mono text-[12px] text-slate-400 normal-case'>[{problem.grade}]</span>
                            {problem.stars ? (
                              <div className='flex origin-left scale-75 items-center'>
                                <Stars numStars={problem.stars} includeStarOutlines={false} />
                              </div>
                            ) : null}
                            <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                            {problem.broken && (
                              <span className='ml-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500 uppercase'>
                                {problem.broken}
                              </span>
                            )}
                          </div>

                          {(problem.text || problem.subText) && (
                            <div className='mt-0.5 text-[12px] leading-relaxed'>
                              {problem.text && <span className='mr-2 text-slate-400 italic'>{problem.text}</span>}
                              {problem.subText && <span className='font-medium text-slate-500'>{problem.subText}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
