import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Trailing glyph for links in body copy (markdown + `<Linkify>` fields) that leave the app or open a mail client.
 *
 * Replaces a standing underline: the URL itself keeps the surrounding ink and only a small gold `--color-link`
 * arrow marks it as clickable, so link-dense comments stay calm. Sized in `em` so it tracks the line’s font size
 * (13px tick comments, 16px trivia, …) instead of being fixed at 12px.
 *
 * `aria-hidden` keeps screen readers on the link text — the glyph carries no meaning of its own.
 */
export const BodyLinkIcon = ({ className }: { className?: string }) => (
  <>
    {/* Word joiner: keeps the glyph on the same line as the last character of the URL when the link wraps. */}
    {'\u2060'}
    <ExternalLink
      aria-hidden
      className={cn('text-link ml-0.5 inline-block size-[0.8em] align-[-0.125em]', className)}
    />
  </>
);
