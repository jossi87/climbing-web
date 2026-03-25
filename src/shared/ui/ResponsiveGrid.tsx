import { type ReactNode } from 'react';

export const ResponsiveGrid = ({ children }: { children: ReactNode }) => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>{children}</div>
);
