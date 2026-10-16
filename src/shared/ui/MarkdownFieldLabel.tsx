import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

type Props = { children: ReactNode; className?: string };

/**
 * Form label with “(supports markdown)” and a link to a live demo — use on description / rich-text fields
 * (Area, Sector, Problem edit, etc.).
 */
export function MarkdownFieldLabel({ children, className }: Props) {
  return (
    <label className={className}>
      {children}{' '}
      <Trans
        i18nKey='markdownField.supports'
        components={{
          link: (
            <a
              href='https://jonschlinkert.github.io/remarkable/demo/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-brand underline'
            />
          ),
        }}
      />
    </label>
  );
}
