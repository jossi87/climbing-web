import { type ReactNode } from 'react';

export const ResponsiveGrid = ({ children }: { children: ReactNode }) => (
  <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>{children}</div>
);
