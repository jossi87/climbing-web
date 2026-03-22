import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LockSymbol, Stars, SunOnWall, WallDirection } from '../../common/widgets/widgets';
import type { components } from '../../../@types/buldreinfo/swagger';
import { ArrowUpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const JumpToTop = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className='text-slate-600 hover:text-white transition-colors p-1'
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
          Pick<
            components['schemas']['Problem'],
            'id' | 'name' | 'lockedAdmin' | 'lockedSuperadmin' | 'grade' | 'nr'
          >
        > &
          Pick<
            components['schemas']['Problem'],
            'stars' | 'ticked' | 'todo' | 'coordinates' | 'broken'
          > & {
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
    return (
      <div className='p-8 text-center text-slate-500 italic'>
        No results match your search criteria.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {header}

      <div className='flex flex-wrap gap-1.5 p-3 bg-surface-nav/30 rounded-xl border border-surface-border/50'>
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() =>
              areaRefs.current[area.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-brand/50 transition-all'
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
            <div className='flex items-center justify-between border-b-2 border-surface-border pb-3 mb-6'>
              <div className='flex items-center gap-3'>
                <Link
                  to={`/area/${area.id}`}
                  className='text-2xl font-black text-white hover:text-brand transition-colors uppercase tracking-tight'
                >
                  {area.name}
                </Link>
                <LockSymbol
                  lockedAdmin={area.lockedAdmin}
                  lockedSuperadmin={area.lockedSuperadmin}
                />
                <SunOnWall sunFromHour={area.sunFromHour} sunToHour={area.sunToHour} />
              </div>
              <JumpToTop />
            </div>

            <div className='space-y-10'>
              {area.sectors.map((sector) => (
                <div key={sector.id} className='space-y-4'>
                  <div className='flex items-center justify-between border-b border-surface-border/50 pb-2'>
                    <div className='flex items-center gap-3'>
                      <Link
                        to={`/sector/${sector.id}`}
                        className='text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest'
                      >
                        {sector.name}
                      </Link>
                      <LockSymbol
                        lockedAdmin={sector.lockedAdmin}
                        lockedSuperadmin={sector.lockedSuperadmin}
                      />
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
                          'flex gap-4 p-2.5 rounded-lg transition-colors border border-transparent',
                          problem.ticked
                            ? 'bg-green-500/5 border-green-500/10'
                            : problem.todo
                              ? 'bg-blue-500/5 border-blue-500/10'
                              : 'hover:bg-surface-nav/30',
                        )}
                      >
                        <div className='text-[11px] font-mono text-slate-500 w-6 pt-0.5 shrink-0'>
                          #{problem.nr}
                        </div>

                        <div className='flex flex-col gap-1 min-w-0 flex-1'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <Link
                              to={`/problem/${problem.id}`}
                              className={cn(
                                'text-[14px] font-bold transition-colors',
                                problem.broken
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-200 hover:text-white',
                              )}
                            >
                              {problem.name}
                            </Link>
                            <span className='text-[12px] font-mono text-slate-400 normal-case'>
                              [{problem.grade}]
                            </span>
                            {problem.stars ? (
                              <div className='scale-75 origin-left flex items-center'>
                                <Stars numStars={problem.stars} includeStarOutlines={false} />
                              </div>
                            ) : null}
                            <LockSymbol
                              lockedAdmin={problem.lockedAdmin}
                              lockedSuperadmin={problem.lockedSuperadmin}
                            />
                            {problem.broken && (
                              <span className='text-[9px] font-bold text-red-500 uppercase px-1.5 py-0.5 bg-red-500/10 rounded ml-1'>
                                {problem.broken}
                              </span>
                            )}
                          </div>

                          {(problem.text || problem.subText) && (
                            <div className='text-[12px] leading-relaxed mt-0.5'>
                              {problem.text && (
                                <span className='text-slate-400 italic mr-2'>{problem.text}</span>
                              )}
                              {problem.subText && (
                                <span className='text-slate-500 font-medium'>
                                  {problem.subText}
                                </span>
                              )}
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
