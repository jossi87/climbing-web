import { type ReactNode } from 'react';

export const List = ({ children }: { children: ReactNode }) => (
  <ul className='space-y-4'>{children}</ul>
);

export const ListItem = ({ children }: { children: ReactNode }) => (
  <li className='flex gap-3'>
    <div className='h-1.5 w-1.5 rounded-full bg-brand mt-2 shrink-0 shadow-[0_0_8px_rgba(5,150,105,0.4)]' />
    <span className='text-sm text-slate-300 leading-relaxed'>{children}</span>
  </li>
);
