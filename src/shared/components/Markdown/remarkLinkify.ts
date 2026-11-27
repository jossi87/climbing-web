import { find } from 'linkifyjs';
import type { Link, Root, RootContent, Text } from 'mdast';

/**
 * mdast node types whose children must stay untouched: existing links (never nest anchors), code, raw HTML and
 * images (their text lives in `alt`, not in children).
 */
const SKIP_TYPES = new Set<string>([
  'link',
  'linkReference',
  'code',
  'inlineCode',
  'html',
  'image',
  'imageReference',
  'definition',
]);

/**
 * Splits one plain text node into text + link nodes, using the same URL/e-mail detection as the `<Linkify>` fields
 * (comments, ticks, access info). Returns `null` when the text holds no link.
 */
const splitText = (value: string): RootContent[] | null => {
  const tokens = find(value);
  if (tokens.length === 0) return null;

  const nodes: RootContent[] = [];
  let cursor = 0;
  for (const token of tokens) {
    if (token.start > cursor) {
      nodes.push({ type: 'text', value: value.slice(cursor, token.start) } satisfies Text);
    }
    nodes.push({
      type: 'link',
      url: token.href,
      title: null,
      children: [{ type: 'text', value: token.value }],
    } satisfies Link);
    cursor = token.end;
  }
  if (cursor < value.length) {
    nodes.push({ type: 'text', value: value.slice(cursor) } satisfies Text);
  }
  return nodes;
};

/** Walks a parent node and replaces text containing bare URLs/e-mails with text + `link` nodes. */
const linkifyChildren = (parent: { children: RootContent[] }): void => {
  for (let i = 0; i < parent.children.length; i += 1) {
    const child = parent.children[i];
    if (child.type === 'text') {
      const nodes = splitText(child.value);
      if (nodes) {
        parent.children.splice(i, 1, ...nodes);
        // Skip the nodes we just produced — their text is already linkified.
        i += nodes.length - 1;
      }
      continue;
    }
    if (!SKIP_TYPES.has(child.type) && 'children' in child) {
      linkifyChildren(child);
    }
  }
};

/**
 * Remark plugin: turns bare URLs / e-mail addresses in markdown body text into `link` nodes, so trivia, descriptions
 * and aid notes autolink exactly like the `<Linkify>`-rendered comment fields. Authored markdown links
 * (`[text](https://…)`) and inline code are left alone; the resulting anchors are styled by `Markdown`'s `a` renderer.
 */
export const remarkLinkify = () => (tree: Root) => {
  linkifyChildren(tree);
};
