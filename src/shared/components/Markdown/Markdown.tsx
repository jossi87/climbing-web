import { type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type MarkdownProps = {
  content?: string | null;
};

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      className='hover:text-brand light:decoration-slate-400/40 text-inherit underline decoration-white/15 underline-offset-2 transition-colors'
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className='mt-0 mb-0 [&+&]:mt-2'>{children}</p>,
  ul: ({ children }) => <ul className='my-2 list-disc pl-5 marker:text-slate-500'>{children}</ul>,
  ol: ({ children }) => <ol className='my-2 list-decimal pl-5 marker:text-slate-500'>{children}</ol>,
  li: ({ children }) => <li className='my-0.5'>{children}</li>,
  h1: ({ children }) => <h1 className='mt-3 mb-1 text-base font-semibold text-slate-200'>{children}</h1>,
  h2: ({ children }) => <h2 className='mt-3 mb-1 text-[15px] font-semibold text-slate-200'>{children}</h2>,
  h3: ({ children }) => <h3 className='mt-2 mb-1 text-sm font-semibold text-slate-200'>{children}</h3>,
  strong: ({ children }) => <strong className='font-semibold text-slate-200'>{children}</strong>,
  em: ({ children }) => <em className='italic'>{children}</em>,
  code: ({ children }) => (
    <code className='rounded bg-white/8 px-1 py-0.5 font-mono text-[13px] text-slate-200'>{children}</code>
  ),
  pre: ({ children }) => (
    <pre className='my-2 overflow-x-auto rounded-lg bg-white/6 p-3 font-mono text-[13px] leading-relaxed text-slate-300'>
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className='my-2 border-l-2 border-slate-500/30 pl-3 text-slate-400 italic'>{children}</blockquote>
  ),
  hr: () => <hr className='my-3 border-t border-white/10' />,
};

export const Markdown: FC<MarkdownProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div className='text-pretty [overflow-wrap:anywhere]'>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};
