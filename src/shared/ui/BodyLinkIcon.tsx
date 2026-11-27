import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Trailing glyph for links in body copy (markdown + `<Linkify>` fields) that leave the app or open a mail client.
 *
 * Replaces a standing underline: the URL keeps the surrounding ink and only a small arrow marks it as clickable, so
 * link-dense comments stay calm. The glyph strokes with `currentColor`, so it is always the same color as the link
 * text — including the `hover:text-link` warm-up, which the icon picks up together with the words.
 *
 * Sized in `em` so it tracks the line’s font size (13px tick comments, 16px trivia, …). `align-[-0.04em]` centers
 * its height on cap height (≈ the line-box center); `align-middle` / x-height centering left it a hair low next to
 * lowercase-heavy URLs.
 *
 * `aria-hidden` keeps screen readers on the link text — the glyph carries no meaning of its own.
 */
export const BodyLinkIcon = ({ className }: { className?: string }) => (
  <>
    {/* Word joiner: keeps the glyph on the same line as the last character of the URL when the link wraps. */}
    {'\u2060'}
    <ExternalLink aria-hidden className={cn('ml-0.5 inline-block size-[0.8em] align-[-0.04em]', className)} />
  </>
);
