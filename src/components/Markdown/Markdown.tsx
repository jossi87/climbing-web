import { type FC, useEffect, useState } from 'react';

type MarkdownProps = {
  content?: string | null;
};

export const Markdown: FC<MarkdownProps> = ({ content }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (content) {
      import('./parser').then(({ md }) => {
        setHtml(md.render(content));
      });
    }
  }, [content]);

  if (!content) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
