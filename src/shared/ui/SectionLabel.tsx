import { type ReactNode } from 'react';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';

export const SectionLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('block', designContract.typography.sectionEyebrow, className)}>{children}</span>
);
