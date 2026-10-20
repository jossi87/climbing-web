import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown } from 'lucide-react';
import { useMeta } from './Meta/context';
import { useSetLanguagePreference } from '../../api';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/config';
import { useLanguage } from '../../i18n/useLanguage';
import { cn } from '../../lib/utils';
import { LanguageFlag } from '../ui';
/* Same header slot as `ThemeToggle`, so the same hand-tuned chrome colours. */
import { CHROME, CHROME_BORDER, CHROME_HOVER, CHROME_ICON } from './ThemeToggle';

type LanguageOption = { code: SupportedLanguage; label: string };

/**
 * Header language selector — a chrome pill beside `ThemeToggle` whose menu offers every locale.
 *
 * **The trigger is a code, not a flag.** A lone national flag is a 1990s language-picker idiom: it names
 * a country where the control is about a language, and it reads as an image asset next to the flat
 * lucide glyphs already in the bar. The pill shows just the active locale's code (`EN`, `CS`) and a
 * chevron — a glyph beside it was redundant once the letters name the language, and dropping it keeps
 * the narrow control narrower still. Flags live in the menu, where they are a recognisable per-row
 * marker beside the language's own name and cost no header space.
 *
 * Why not the native `<select>` this replaced: a `<select>` popup is OS chrome, so it can neither show
 * flags nor the language's own name at a readable size. The button mirrors `aria-haspopup='menu'` and
 * the menu lists each locale by name with the active one checked; the control stays
 * keyboard-operable (arrows/Home/End, Escape returns to the button). The panel is anchored to the
 * button like the account menu in `Header.tsx`, so it follows the header when that slides away on
 * scroll.
 *
 * Only rendered when the visitor actually has a choice — see the early return.
 */
export function LanguageSelect() {
  const meta = useMeta();
  const { t } = useTranslation();
  const { active, setLanguage } = useLanguage();
  const { mutateAsync: setLanguagePreference } = useSetLanguagePreference();

  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Which item the keyboard should land on once the menu is in the DOM. */
  const focusOnOpen = useRef<'active' | 'first' | 'last' | null>(null);

  /**
   * Offered locales = catalogs this bundle ships ∩ languages the backend serves. Labels are the
   * language's own name as the backend reports it (`cs` → "Czech"), so a new locale needs no frontend
   * label map.
   */
  const options = useMemo<LanguageOption[]>(() => {
    const offered = SUPPORTED_LANGUAGES.flatMap((code) => {
      const language = meta.languages.find((item) => item.code === code);
      return language ? [{ code, label: language.name }] : [];
    });

    // The active locale can sit outside the region's list (a preference stored while browsing another
    // region) — keep it selectable instead of leaving the control blank.
    if (offered.some((option) => option.code === active)) return offered;
    const own = meta.languages.find((item) => item.code === active);
    return [{ code: active, label: own?.name ?? active }, ...offered];
  }, [active, meta.languages]);

  const activeIndex = options.findIndex((option) => option.code === active);
  const activeLabel = activeIndex >= 0 ? options[activeIndex].label : active;

  /**
   * Close on an outside press, or on `Escape` — which also hands focus back to the button. `open` is a
   * dep so the listeners exist only while the menu does.
   */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  /**
   * Move focus into the menu when the keyboard opened it, so the arrows keep working without a first Tab.
   * A pointer opening leaves focus on the button.
   */
  useEffect(() => {
    if (!open) return;

    const target = focusOnOpen.current;
    focusOnOpen.current = null;
    if (!target) return;

    const index = target === 'first' ? 0 : target === 'last' ? options.length - 1 : Math.max(activeIndex, 0);
    itemRefs.current[index]?.focus();
  }, [open, options.length, activeIndex]);

  /**
   * A single locale is not a choice: stay out of the header — and out of the tab order — while only one
   * catalog is both shipped (`SUPPORTED_LANGUAGES`) and served (`meta.languages`).
   */
  if (options.length < 2) return null;

  const handleSelect = (code: SupportedLanguage) => {
    setOpen(false);
    // The picked item unmounts with the menu — keep focus on the control instead of losing it to `<body>`.
    triggerRef.current?.focus();
    if (code === active) return;

    setLanguage(code);
    if (meta.isAuthenticated) {
      setLanguagePreference(code).catch(() => {
        /* Silently ignore — localStorage fallback is sufficient */
      });
    }
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    let intent: 'active' | 'first' | 'last' | null = null;
    if (key === 'ArrowUp') intent = 'last';
    else if (key === 'ArrowDown' || key === 'Enter' || key === ' ') intent = activeIndex >= 0 ? 'active' : 'first';
    if (intent === null) return;

    // `preventDefault` also swallows the click a button would otherwise synthesise from Enter/Space.
    event.preventDefault();
    if (open) {
      // Already up (a pointer opened it), so the items are in the DOM — take focus straight away.
      const index = intent === 'first' ? 0 : intent === 'last' ? options.length - 1 : Math.max(activeIndex, 0);
      itemRefs.current[index]?.focus();
      return;
    }

    // Still closed: the effect above focuses once the menu has rendered.
    focusOnOpen.current = intent;
    setOpen(true);
  };

  /** Arrow keys walk the items; `Tab` leaves the menu (Escape is handled document-wide above). */
  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (key === 'Tab') {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const last = options.length - 1;
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    let next: number | null = null;
    if (key === 'ArrowDown') next = current >= last ? 0 : current + 1;
    else if (key === 'ArrowUp') next = current <= 0 ? last : current - 1;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    itemRefs.current[next]?.focus();
  };

  return (
    <span className='relative flex h-8 shrink-0 items-center'>
      <button
        ref={triggerRef}
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={`${t('language.selectorLabel')}: ${activeLabel}`}
        title={activeLabel}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        onKeyDown={handleTriggerKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          backgroundColor: hover || open ? CHROME_HOVER : CHROME,
          color: CHROME_ICON,
          border: CHROME_BORDER,
        }}
        className={cn(
          'box-border flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 transition-colors',
          'focus-visible:ring-brand-border/70 focus-visible:ring-offset-surface-dark focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        {/* The visible code *is* the label: locale codes are what the menu selects (`EN`, `CS`). */}
        <span className='text-[11px] leading-none font-semibold tracking-[0.1em] uppercase'>
          {active.toUpperCase()}
        </span>
        {/* Always visible: with no icon, the chevron is what makes the pill read as a menu on phones too. */}
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          aria-hidden
          className={cn('shrink-0 opacity-60 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role='menu'
          aria-label={t('language.selectorLabel')}
          onKeyDown={handleMenuKeyDown}
          className='border-surface-border bg-surface-card animate-in fade-in absolute top-full right-0 z-70 mt-3 w-44 overflow-hidden rounded-xl border py-2 shadow-2xl ring-1 ring-white/10 duration-150'
        >
          {options.map((option, index) => {
            const isActive = option.code === active;
            return (
              <button
                key={option.code}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type='button'
                role='menuitemradio'
                aria-checked={isActive}
                onClick={() => handleSelect(option.code)}
                className={cn(
                  'mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] leading-snug font-medium transition-colors',
                  isActive
                    ? 'bg-surface-hover ring-brand-border/70 text-slate-50 ring-1'
                    : 'hover:bg-surface-raised-hover text-slate-300 hover:text-slate-50',
                )}
              >
                <LanguageFlag code={option.code} />
                <span className='min-w-0 flex-1 truncate'>{option.label}</span>
                {isActive && <Check size={14} strokeWidth={2.5} aria-hidden className='text-brand shrink-0' />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
