import { type ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
};

export const TextLink = ({ href, children, external = true }: Props) => {
  const className =
    'text-slate-100 hover:text-brand transition-colors font-bold underline decoration-brand/30 underline-offset-4';

  return (
    <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  );
};
