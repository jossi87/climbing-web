import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';

export const md = (() => {
  const md = new Remarkable({ breaks: true }).use(linkify);
  // open links in new windows
  md.renderer.rules.link_open = (function () {
    const original = md.renderer.rules.link_open;
    return function (...args: Parameters<typeof original>) {
      const link = original(...args);
      return link.substring(0, link.length - 1) + ' rel="noreferrer noopener" target="_blank">';
    };
  })();
  return md;
})();
