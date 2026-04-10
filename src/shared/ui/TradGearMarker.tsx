import type { ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/** URL path served from `public/svg/wire.svg`. */
export const PASSIVE_GEAR_WIRE_SVG_SRC = '/svg/wire.svg';

type WireGlyphImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'>;

function WireGlyphImg({ className, ...rest }: WireGlyphImgProps) {
  return (
    <img
      src={PASSIVE_GEAR_WIRE_SVG_SRC}
      alt=''
      decoding='async'
      draggable={false}
      loading='lazy'
      className={cn('trad-gear-wire-icon shrink-0', className)}
      {...rest}
    />
  );
}

export type TradGearMarkerProps = {
  /** Route type line (`title` / `aria-label`); shown only when it represents passive gear (callers filter). */
  line: string;
  className?: string;
  iconClassName?: string;
};

export function TradGearMarker({ line, className, iconClassName }: TradGearMarkerProps) {
  const label = line.trim();
  if (!label) return null;

  return (
    <span
      role='img'
      title={label}
      aria-label={label}
      className={cn(
        'trad-gear-marker-wrap ml-1.5 inline-flex shrink-0 items-center align-[-0.15em] leading-none',
        className,
      )}
    >
      <WireGlyphImg className={iconClassName} aria-hidden />
    </span>
  );
}
