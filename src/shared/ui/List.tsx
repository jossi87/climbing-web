import { type ReactNode } from 'react';

export const List = ({ children }: { children: ReactNode }) => <ul className='space-y-4'>{children}</ul>;

export const ListItem = ({ children }: { children: ReactNode }) => (
  <li className='flex gap-3'>
    <div className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400/80' />
    <span className='text-sm leading-relaxed text-slate-300'>{children}</span>
  </li>
);
