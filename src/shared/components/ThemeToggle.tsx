import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/useTheme';
import { cn } from '../../lib/utils';

/** Inline hover fill avoids glass-header / `backdrop-filter` compositing bugs and `::before` z-index pitfalls. */
const CHROME = 'rgb(28, 30, 36)';
const CHROME_HOVER = 'rgb(51, 53, 61)';
/** Same in both global themes: preflight `button { color: inherit }` would otherwise pull page body ink onto dark chrome. */
const CHROME_ICON = '#ffffff';
/** Keep off `border-white/12` — `html[data-theme="light"] .border-white/12` remaps to dark ink and vanishes on the dark bar. */
const CHROME_BORDER = '1px solid rgba(255, 255, 255, 0.12)';

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';
  const [hover, setHover] = useState(false);

  return (
    <button
      type='button'
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        backgroundColor: hover ? CHROME_HOVER : CHROME,
        color: CHROME_ICON,
        border: CHROME_BORDER,
      }}
      className={cn(
        'box-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
        'focus-visible:ring-brand-border/70 focus-visible:ring-offset-surface-dark focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      {isDark ? <Sun size={18} strokeWidth={2} aria-hidden /> : <Moon size={18} strokeWidth={2} aria-hidden />}
    </button>
  );
}
