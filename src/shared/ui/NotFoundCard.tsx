import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

export type NotFoundCardProps = {
  /** Page heading (e.g. `404 Error`, `404`, `Not Found`). */
  title?: string;
  description: ReactNode;
  /** Extra classes on the outer full-width wrapper (e.g. vertical spacing). */
  className?: string;
};

/**
 * Missing resource / permission denied — same {@link Card} / `.app-card` shell as other main content.
 * Full width of the main column (`w-full min-w-0`); no `max-w-*` on the card so it stays fluid on phones.
 */
export function NotFoundCard({ title = '404 Error', description, className }: NotFoundCardProps) {
  return (
    <div className={cn('w-full min-w-0', className)}>
      <Card className='min-w-0 border-0'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <AlertTriangle size={48} className='shrink-0 text-red-500 opacity-50' aria-hidden />
          <h2 className='type-h1'>{title}</h2>
          <div className={cn('w-full max-w-prose text-pretty text-slate-400', designContract.typography.body)}>
            {description}
          </div>
        </div>
      </Card>
    </div>
  );
}
