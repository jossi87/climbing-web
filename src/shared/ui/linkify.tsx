import type { IntermediateRepresentation, Opts } from 'linkifyjs';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';
import { BodyLinkIcon } from './BodyLinkIcon';

/**
 * `linkify-react` renders every detected URL/e-mail through this, so plain-text fields (comments, ticks, access info,
 * pitch descriptions) get exactly the same anchor markup as rendered markdown: body ink, a trailing `BodyLinkIcon`
 * glyph, hover underline, and a new tab.
 *
 * linkify hands back HTML-shaped `attributes` (`class`, `href`, …) — React needs `className`, so map it here.
 */
const renderBodyLink = ({ attributes, content }: IntermediateRepresentation) => {
  const { class: className, ...rest } = attributes;
  return (
    <a {...rest} className={cn(designContract.typography.bodyLink, className)}>
      {content}
      <BodyLinkIcon />
    </a>
  );
};

export const inlineLinkifyOptions: Opts = {
  render: renderBodyLink,
  target: '_blank',
  rel: 'noreferrer noopener',
};
