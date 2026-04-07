import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  className?: string;
};

export const NavItem = ({ to, icon: Icon, label, className }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'group relative flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 transition-colors',
        isActive ? 'font-semibold' : 'opacity-70 hover:opacity-100',
        className,
      )}
    >
      <Icon size={18} className={cn('transition-colors', isActive ? 'text-brand' : 'group-hover:text-slate-200')} />
      <span className='text-sm font-medium'>{label}</span>
      {isActive && (
        <div className='bg-brand absolute right-0 -bottom-0.5 left-0 z-50 h-0.5 rounded-full lg:-bottom-4.25' />
      )}
    </Link>
  );
};
