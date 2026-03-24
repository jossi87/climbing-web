import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export const Card = ({ children, className = '', flush = false }: Props) => (
  <div
    className={`app-card shadow-xl relative overflow-hidden border-x-0 sm:border rounded-none sm:rounded-xl ${className}`}
  >
    <div className={`h-full ${flush ? '' : 'p-4 sm:p-6'}`}>{children}</div>
  </div>
);
