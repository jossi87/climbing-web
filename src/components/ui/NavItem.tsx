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
        'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all group relative shrink-0',
        isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200',
        className,
      )}
    >
      <Icon
        size={18}
        className={cn('transition-colors', isActive ? 'text-brand' : 'group-hover:text-slate-200')}
      />
      <span className='text-sm font-medium'>{label}</span>
      {isActive && (
        <div className='absolute -bottom-0.5 lg:-bottom-4.25 left-0 right-0 h-0.5 bg-brand rounded-full z-50 shadow-brand' />
      )}
    </Link>
  );
};
