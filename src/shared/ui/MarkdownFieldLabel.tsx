import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

/**
 * Form label with “(supports markdown)” and a link to a live demo — use on description / rich-text fields
 * (Area, Sector, Problem edit, etc.).
 */
export function MarkdownFieldLabel({ children, className }: Props) {
  return (
    <label className={className}>
      {children} (supports{' '}
      <a
        href='https://jonschlinkert.github.io/remarkable/demo/'
        target='_blank'
        rel='noopener noreferrer'
        className='text-brand underline'
      >
        markdown
      </a>
      )
    </label>
  );
}
