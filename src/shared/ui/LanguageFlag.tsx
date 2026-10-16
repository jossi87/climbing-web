import { useId, type ComponentType } from 'react';
import { cn } from '../../lib/utils';

/**
 * Inline flag artwork for a locale code — the visual token `LanguageSelect` shows for a language.
 *
 * **Why hand-drawn SVG instead of Unicode flag emoji.** A regional-indicator pair (`🇨🇿`, `🇬🇧`) has no
 * glyph in the Windows emoji font, so Chrome/Edge on Windows paint the two letters instead of a flag —
 * the header control would look broken on the desktop most visitors use. Inline SVG paints the same on
 * every platform and, unlike an asset under `public/`, costs no request and follows the chip's ring.
 *
 * **Why one aspect box.** Every artwork is drawn in a 3:2 box (`viewBox='0 0 60 40'`) so a single size
 * class fits them all. The Czech flag *is* 3:2; the Union Jack is 2:1 in its official form, so its
 * (correct, counterchanged) 60×30 geometry is stretched into the shared box — the same normalisation
 * flag icon sets ship as their 3:2 and 4:3 variants.
 *
 * **A code without artwork is not an error.** It renders the code itself, in the same box, which keeps
 * "adding a locale takes three edits" (see `i18n/config.ts`) true: a new locale shows its letters until
 * someone draws it a flag.
 */

type FlagProps = { className?: string };

/**
 * Shared box: 3:2, sized for the 32px header button, clipped to the chip radius. The hairline ring is
 * theme-aware (`--color-surface-border`) because the flag is shown both on the near-black header
 * chrome and on the menu surface, and it is what stops the white half of the Czech flag from melting
 * into the light-mode menu card.
 */
const FLAG_BOX = 'block h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-surface-border/60';

/** Czechia — white over red with the hoist triangle reaching the flag's centre (official 2:3 layout). */
function CzechFlag({ className }: FlagProps) {
  return (
    <svg viewBox='0 0 60 40' aria-hidden className={cn(FLAG_BOX, className)}>
      <path d='M0,0 H60 V20 H0 Z' fill='#fff' />
      <path d='M0,20 H60 V40 H0 Z' fill='#d7141a' />
      <path d='M0,0 L30,20 L0,40 Z' fill='#11457e' />
    </svg>
  );
}

/**
 * United Kingdom — the European shorthand for the English locale (the flag names a country, not a
 * language; the menu spells the language out).
 *
 * Geometry is the official 2:1 construction: white saltire ±3, red saltire (width 4) counterchanged
 * so it hugs one side of the white band in each quadrant, then St George's cross (white 10, red 6).
 */
function UnionJackFlag({ className }: FlagProps) {
  /** A `clipPath` id is document-global, so two flags on one page must not share one. */
  const saltireClipId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-saltire`;

  return (
    <svg viewBox='0 0 60 40' aria-hidden className={cn(FLAG_BOX, className)}>
      <defs>
        <clipPath id={saltireClipId}>
          {/* Counterchange region: red is painted only where it sits on one side of the white saltire. */}
          <path d='M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z' />
        </clipPath>
      </defs>
      {/* Official 2:1 geometry, stretched to the shared 3:2 box; every band keeps its proportion. */}
      <g transform='scale(1, 1.3333)'>
        <path d='M0,0 v30 h60 v-30 z' fill='#012169' />
        <path d='M0,0 L60,30 M60,0 L0,30' fill='none' stroke='#fff' strokeWidth={6} />
        <path
          d='M0,0 L60,30 M60,0 L0,30'
          fill='none'
          stroke='#c8102e'
          strokeWidth={4}
          clipPath={`url(#${saltireClipId})`}
        />
        <path d='M30,0 v30 M0,15 h60' fill='none' stroke='#fff' strokeWidth={10} />
        <path d='M30,0 v30 M0,15 h60' fill='none' stroke='#c8102e' strokeWidth={6} />
      </g>
    </svg>
  );
}

const LANGUAGE_FLAGS: Record<string, ComponentType<FlagProps> | undefined> = {
  cs: CzechFlag,
  en: UnionJackFlag,
};

/** The code, in the flag's own box, for a locale that ships no artwork — keeps the menu labels aligned. */
const CODE_BOX = 'flex h-[14px] w-[21px] shrink-0 items-center justify-center text-[10px] font-semibold uppercase';

/**
 * Visual token for a locale: its flag, or its code while no artwork ships yet. Decorative by design
 * (`aria-hidden`): the language name, or the control's `aria-label`, carries the meaning.
 */
export function LanguageFlag({ code, className }: { code: string; className?: string }) {
  const Flag = LANGUAGE_FLAGS[code];
  if (Flag) return <Flag className={className} />;

  return <span className={cn(CODE_BOX, className)}>{code}</span>;
}
