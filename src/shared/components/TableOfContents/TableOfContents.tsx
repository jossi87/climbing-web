import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LockSymbol, Stars } from '../../ui/Indicators';
import { SunOnWall, WallDirection } from '../Widgets/ClimbingWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';
import { ArrowUpCircle, Compass, Sun } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { profileRowMiddleDotClass } from '../Profile/ProfileRowTextSep';
import { tickProblemLinkWithStatus } from '../Profile/profileRowTypography';
import { TradGearMarker } from '../../ui/TradGearMarker';

const JumpToTop = ({ compact = false }: { compact?: boolean }) => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className={cn(
      'transition-colors hover:opacity-100',
      compact
        ? 'type-micro bg-surface-raised inline-flex items-center gap-1 rounded-full border border-white/12 px-2 py-0.5 opacity-80'
        : 'p-1 opacity-70',
    )}
  >
    <ArrowUpCircle size={compact ? 12 : 16} />
    {compact && <span>Top</span>}
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
            passiveGearTooltip?: string;
          })[];
      })[];
  })[];
  header?: ReactNode;
  subHeader?: ReactNode;
  compact?: boolean;
  /** Hide per-area “Top” scroll control (e.g. below a map where it reads as map chrome). */
  showAreaJumpToTop?: boolean;
};

const getSunLabel = (fromHour?: number, toHour?: number) => {
  if (fromHour === undefined || toHour === undefined || fromHour <= 0 || toHour > 24 || fromHour >= toHour) return null;
  return `${String(fromHour).padStart(2, '0')}:00-${String(toHour).padStart(2, '0')}:00`;
};

const getWallLabel = (wallDirectionManual?: { direction?: string }, wallDirectionCalculated?: { direction?: string }) =>
  wallDirectionManual?.direction ?? wallDirectionCalculated?.direction ?? null;

export const TableOfContents = ({ areas, header, subHeader, compact = false, showAreaJumpToTop = true }: Props) => {
  const areaRefs = useRef<Record<number, HTMLElement | null>>({});

  if (!areas || areas.length === 0) {
    return <div className='p-8 text-center text-slate-500 italic'>No results match your search criteria.</div>;
  }

  return (
    <div className={cn(compact ? 'space-y-4' : 'space-y-6')}>
      {header}

      {compact ? (
        <div className='type-micro text-slate-400'>
          {areas.map((area, index) => (
            <span key={area.id}>
              {index > 0 && <span className={cn('mx-2', profileRowMiddleDotClass)}>·</span>}
              <button
                onClick={() => areaRefs.current[area.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className='hover:text-brand transition-colors'
              >
                {area.name}
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className='bg-surface-raised border-surface-border/50 flex flex-wrap gap-1.5 rounded-xl border p-3'>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => areaRefs.current[area.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className='type-label border-surface-border bg-surface-raised hover:border-brand-border flex items-center gap-1.5 rounded-lg border px-2.5 py-1 opacity-80 transition-all hover:opacity-100'
            >
              {area.name}
              <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
            </button>
          ))}
        </div>
      )}

      {subHeader}

      <div className={cn(compact ? 'space-y-5' : 'space-y-16')}>
        {areas.map((area) => (
          <section
            key={area.id}
            ref={(el) => {
              areaRefs.current[area.id] = el;
            }}
            className='scroll-mt-24'
          >
            <div
              className={cn(
                'flex items-center justify-between',
                compact ? 'mb-2 pb-0.5' : 'border-surface-border mb-6 border-b-2 pb-3',
              )}
            >
              <div className='flex items-center gap-3'>
                <Link
                  to={`/area/${area.id}`}
                  className={cn('hover:text-brand transition-colors', compact ? 'type-h2' : 'type-h1')}
                >
                  {area.name}
                </Link>
                <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
                {compact ? (
                  getSunLabel(area.sunFromHour, area.sunToHour) ? (
                    <span className='type-micro bg-surface-raised inline-flex items-center gap-1 rounded-full border border-white/12 px-2 py-0.5 text-slate-200'>
                      <Sun size={10} className='text-slate-300/90' />
                      {getSunLabel(area.sunFromHour, area.sunToHour)}
                    </span>
                  ) : null
                ) : (
                  <SunOnWall sunFromHour={area.sunFromHour} sunToHour={area.sunToHour} />
                )}
              </div>
              {showAreaJumpToTop ? compact ? <JumpToTop compact /> : <JumpToTop /> : null}
            </div>

            <div className={cn(compact ? 'space-y-3.5' : 'space-y-10')}>
              {area.sectors.map((sector) => (
                <div key={sector.id} className={cn(compact ? 'space-y-1.5' : 'space-y-4')}>
                  <div
                    className={cn(
                      'flex items-center justify-between',
                      compact ? 'pb-1' : 'border-surface-border/50 border-b pb-2',
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <Link
                        to={`/sector/${sector.id}`}
                        className={cn(
                          'hover:text-brand text-xs',
                          compact ? 'font-medium tracking-normal normal-case' : designContract.typography.label,
                        )}
                      >
                        {sector.name}
                      </Link>
                      <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                      {compact ? (
                        <>
                          {getWallLabel(sector.wallDirectionManual, sector.wallDirectionCalculated) ? (
                            <span className='type-micro bg-surface-raised inline-flex items-center gap-1 rounded-full border border-white/12 px-2 py-0.5 text-slate-200'>
                              <Compass size={10} className='text-slate-300/90' />
                              {getWallLabel(sector.wallDirectionManual, sector.wallDirectionCalculated)}
                            </span>
                          ) : null}
                          {getSunLabel(sector.sunFromHour, sector.sunToHour) ? (
                            <span className='type-micro bg-surface-raised inline-flex items-center gap-1 rounded-full border border-white/12 px-2 py-0.5 text-slate-200'>
                              <Sun size={10} className='text-slate-300/90' />
                              {getSunLabel(sector.sunFromHour, sector.sunToHour)}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    {!compact && (
                      <div className='flex items-center gap-2'>
                        <>
                          <WallDirection
                            wallDirectionCalculated={sector.wallDirectionCalculated}
                            wallDirectionManual={sector.wallDirectionManual}
                          />
                          <SunOnWall sunFromHour={sector.sunFromHour} sunToHour={sector.sunToHour} />
                        </>
                      </div>
                    )}
                  </div>

                  <div className={cn('flex flex-col', compact ? 'gap-0' : 'gap-1')}>
                    {sector.problems.map((problem) => (
                      <div
                        key={problem.id}
                        className={cn(
                          'flex gap-3 rounded-lg border transition-colors',
                          compact ? 'px-1.5 py-1' : 'p-2.5',
                          problem.broken
                            ? cn(
                                compact ? 'bg-surface-raised/60' : 'bg-surface-raised',
                                designContract.ascentStatus.rowBorderDanger,
                              )
                            : problem.ticked
                              ? cn(
                                  compact ? 'bg-surface-raised/60' : 'bg-surface-raised',
                                  designContract.ascentStatus.rowBorderTicked,
                                )
                              : problem.todo
                                ? cn(
                                    compact ? 'bg-surface-raised/60' : 'bg-surface-raised',
                                    designContract.ascentStatus.rowBorderTodo,
                                  )
                                : 'hover:bg-surface-raised-hover border-transparent',
                        )}
                      >
                        <div className='w-6 shrink-0 pt-0.5 text-[12px] text-slate-500 md:text-[13px]'>
                          #{problem.nr}
                        </div>

                        <div
                          className={cn(
                            'flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 leading-relaxed',
                            designContract.typography.listBody,
                          )}
                        >
                          <div className='flex min-w-0 flex-wrap items-center gap-2'>
                            <Link
                              to={`/problem/${problem.id}`}
                              className={cn(
                                'font-medium transition-colors',
                                problem.broken
                                  ? 'text-slate-300 line-through opacity-70'
                                  : tickProblemLinkWithStatus({
                                      ticked: !!problem.ticked,
                                      todo: !!problem.todo,
                                      broken: false,
                                    }),
                              )}
                            >
                              {problem.name}
                            </Link>
                            <span className='inline-flex min-w-0 items-baseline gap-0.5'>
                              <span className='text-slate-400 normal-case'>{problem.grade}</span>
                              {problem.passiveGearTooltip ? (
                                <TradGearMarker line={problem.passiveGearTooltip} className='ml-0 shrink-0' />
                              ) : null}
                            </span>
                            {problem.stars ? (
                              <div className='flex origin-left scale-75 items-center'>
                                <Stars numStars={problem.stars} size={14} />
                              </div>
                            ) : null}
                            <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                            {problem.broken && (
                              <span className='ml-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500 uppercase'>
                                {problem.broken}
                              </span>
                            )}
                          </div>
                          {problem.subText && (
                            <span className='text-[12px] text-slate-500 sm:text-[13px]'>{problem.subText}</span>
                          )}
                          {problem.text && (
                            <span className='text-[12px] text-slate-400 italic sm:text-[13px]'>{problem.text}</span>
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
