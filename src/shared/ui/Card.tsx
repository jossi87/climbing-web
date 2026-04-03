import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export const Card = ({ children, className = '', flush = false }: Props) => (
  <div
    className={cn(
      'app-card relative overflow-hidden rounded-none border-0 shadow-xl sm:rounded-xl sm:border',
      className,
    )}
  >
    {/*
      Flush cards: avoid `h-full` on the inner wrapper — with an `auto`-height parent, percentage height
      is ill-defined and can interact badly with grid/flex children (frontpage aside CLS).
    */}
    <div className={cn(!flush && 'h-full p-4 sm:p-6')}>{children}</div>
  </div>
);
