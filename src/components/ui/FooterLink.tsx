import { cn } from '../../lib/utils';

type FooterLinkProps = {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  hoverColor?: 'brand' | 'facebook';
};

export const FooterLink = ({
  href,
  icon: Icon,
  title,
  subtitle,
  hoverColor = 'brand',
}: FooterLinkProps) => {
  const hoverClass = hoverColor === 'brand' ? 'hover:text-brand' : 'hover:text-facebook';
  const borderClass =
    hoverColor === 'brand' ? 'group-hover:border-brand/50' : 'group-hover:border-facebook/50';
  const titleHover =
    hoverColor === 'brand' ? 'group-hover:text-brand' : 'group-hover:text-facebook';

  return (
    <a
      href={href}
      rel='noreferrer noopener'
      target='_blank'
      className={cn('flex items-center gap-3 text-slate-300 transition-colors group', hoverClass)}
    >
      <div
        className={cn(
          'p-1.5 rounded bg-surface-card border border-surface-border transition-colors',
          borderClass,
        )}
      >
        <Icon size={16} />
      </div>
      <div className='flex flex-col'>
        <span
          className={cn('text-xs font-bold leading-none text-white transition-colors', titleHover)}
        >
          {title}
        </span>
        <span className='text-[9px] text-slate-600 font-mono'>{subtitle}</span>
      </div>
    </a>
  );
};
