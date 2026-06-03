import { useCallback } from 'react';
import type { components } from '../../@types/buldreinfo/swagger';
import { cn } from '../../lib/utils';

type AreaSector = components['schemas']['AreaSector'];
type TrailSector = components['schemas']['TrailSector'];

type Props = {
  /** All sectors in the area (from the area endpoint). */
  areaSectors: AreaSector[];
  /** The current sector id (always included, cannot be removed). */
  currentSectorId: number | undefined;
  /** The trail's current sectors array. */
  sectors: TrailSector[];
  /** Called when the sectors array changes. */
  onChange: (sectors: TrailSector[]) => void;
};

/**
 * Compact sector selector for trails — shows all sectors in the area as a
 * toggleable list. The current sector is always selected and cannot be
 * removed; other sectors can be appended / removed freely.
 */
export function TrailSectorSelector({ areaSectors, currentSectorId, sectors, onChange }: Props) {
  const isSelected = useCallback((sectorId: number) => sectors.some((s) => s.sectorId === sectorId), [sectors]);

  const toggle = useCallback(
    (sector: AreaSector) => {
      const id = sector.id!;
      if (id === currentSectorId) return; // cannot remove self
      if (isSelected(id)) {
        onChange(sectors.filter((s) => s.sectorId !== id));
      } else {
        onChange([...sectors, { sectorId: id, areaName: sector.areaName, sectorName: sector.name }]);
      }
    },
    [currentSectorId, isSelected, onChange, sectors],
  );

  if (!areaSectors.length) return null;

  return (
    <div className='space-y-1.5'>
      <span className='mb-1 ml-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]'>Shared with sectors</span>
      <div className='flex flex-wrap gap-1.5'>
        {areaSectors.map((s) => {
          const id = s.id!;
          const selected = isSelected(id);
          const isSelf = id === currentSectorId;
          return (
            <button
              key={id}
              type='button'
              onClick={() => toggle(s)}
              disabled={isSelf}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors',
                selected
                  ? 'border-brand/40 bg-brand/15 type-on-accent'
                  : 'border-surface-border hover:type-on-accent text-slate-400 hover:border-slate-500/40',
                isSelf && 'cursor-default opacity-90',
              )}
              title={
                isSelf ? 'This sector (always included)' : selected ? `Remove ${s.name}` : `Share trail with ${s.name}`
              }
            >
              {/* Check indicator */}
              <span
                className={cn(
                  'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                  selected ? 'border-brand bg-brand type-on-accent' : 'border-slate-500/40 bg-transparent',
                )}
              >
                {selected && (
                  <svg width='8' height='8' viewBox='0 0 8 8' fill='none' aria-hidden='true'>
                    <path
                      d='M1 4.5L3 6.5L7 1.5'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )}
              </span>
              <span className='max-w-[120px] truncate'>{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
