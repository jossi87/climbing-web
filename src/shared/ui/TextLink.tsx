import { type ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
};

export const TextLink = ({ href, children, external = true }: Props) => {
  const className =
    'text-slate-100 decoration-brand/30 underline-offset-4 transition-colors hover:text-brand active:text-brand focus-visible:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-border/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card font-bold underline';

  return (
    <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  );
};
