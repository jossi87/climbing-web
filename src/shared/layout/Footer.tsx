import { type ElementType } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Info,
  ShieldCheck,
  FileDown,
  Code2,
  AlertTriangle,
  BarChart3,
  Camera,
  FileText,
  Coffee,
  Heart,
} from 'lucide-react';
import { useMeta } from '../components/Meta/context';
import { SectionLabel } from '../ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

/** Footer grid column titles — a step brighter and larger than default {@link SectionLabel} for `bg-surface-nav`. */
const footerColumnHeadingClass =
  'text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase sm:text-[12px] sm:tracking-[0.1em] sm:text-slate-300';

type NavCardProps = {
  to?: string;
  href?: string;
  icon?: ElementType;
  title: string;
  subtitle?: string;
  className?: string;
  fallbackText?: string;
};

const Footer = () => {
  const { isBouldering } = useMeta();
  const currYear = new Date().getFullYear();

  const NavCard = ({ to, href, icon: Icon, title, subtitle, className, fallbackText }: NavCardProps) => {
    const content = (
      <>
        <div
          className={cn(
            'bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600/45 text-slate-400 transition-colors group-hover:border-slate-500/55 group-hover:text-slate-200 sm:h-9 sm:w-9',
            className,
          )}
        >
          {Icon ? (
            <Icon size={16} />
          ) : (
            <span className='text-xs font-semibold tracking-tight uppercase'>{fallbackText}</span>
          )}
        </div>
        <div className='flex flex-col text-left'>
          <span className='block text-[12px] font-semibold text-slate-200 transition-colors group-hover:text-slate-50 sm:text-[13px]'>
            {title}
          </span>
          {subtitle && (
            <span className={cn('block text-[9px] leading-tight', designContract.typography.label)}>{subtitle}</span>
          )}
        </div>
      </>
    );

    const baseClass = 'flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors group';

    return to ? (
      <Link to={to} onClick={() => window.scrollTo(0, 0)} className={baseClass}>
        {content}
      </Link>
    ) : (
      <a href={href} target='_blank' rel='noreferrer noopener' className={baseClass}>
        {content}
      </a>
    );
  };

  return (
    <footer
      className={cn('bg-surface-nav isolate mt-0 w-full border-t py-7 sm:py-12', designContract.surfaces.shellHairline)}
    >
      <div className='max-w-container mx-auto px-4 sm:px-6'>
        <div className='mb-7 grid grid-cols-2 gap-4 sm:mb-12 sm:gap-8 lg:grid-cols-4'>
          <div className='space-y-2.5 sm:space-y-4'>
            <SectionLabel className={footerColumnHeadingClass}>Navigation</SectionLabel>
            <div className='flex flex-col gap-2 sm:gap-3'>
              <NavCard to='/about' icon={Info} title='About' />
              {!isBouldering && <NavCard to='/dangerous' icon={AlertTriangle} title='Dangerous' />}
              <NavCard to='/graph' icon={BarChart3} title='Graph' />
              <NavCard to='/webcams' icon={Camera} title='Webcams' />
            </div>
          </div>

          <div className='space-y-2.5 sm:space-y-4'>
            <SectionLabel className={footerColumnHeadingClass}>Open Source Stack</SectionLabel>
            <div className='flex flex-col gap-2 sm:gap-3'>
              <NavCard
                href='https://github.com/jossi87/climbing-web'
                icon={Code2}
                title='Frontend'
                subtitle='React / TS'
              />
              <NavCard
                href='https://github.com/jossi87/climbing-ws'
                icon={Coffee}
                title='Backend API'
                subtitle='Java REST'
              />
              <NavCard
                href='https://github.com/jossi87/climbing-leaflet-renderer'
                icon={FileDown}
                title='PDF Maps'
                subtitle='Leaflet'
              />
            </div>
          </div>

          <div className='space-y-2.5 sm:space-y-4'>
            <SectionLabel className={footerColumnHeadingClass}>Affiliation</SectionLabel>
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='group flex items-center gap-3 text-slate-400 transition-colors hover:text-slate-200'
            >
              <div className='bg-surface-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600/45 transition-colors group-hover:border-slate-500/55 sm:h-9 sm:w-9'>
                <img
                  src='/png/brv.png'
                  alt='BRV'
                  className='h-5 w-5 border-0 object-contain opacity-40 brightness-0 invert transition-all outline-none group-hover:opacity-100'
                />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span className='block text-[12px] font-semibold text-slate-200 transition-colors group-hover:text-slate-50 sm:text-[13px]'>
                  BRV
                </span>
                <span className={cn('block text-[9px] leading-tight', designContract.typography.label)}>
                  Bratte Rogalands Venner
                </span>
              </div>
            </a>
          </div>

          <div className='space-y-2.5 sm:space-y-4'>
            <SectionLabel className={footerColumnHeadingClass}>Community</SectionLabel>
            <NavCard
              href='https://www.facebook.com/groups/brattelinjer'
              fallbackText='f'
              title='Bratte Linjer'
              subtitle='Facebook'
            />
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col items-center justify-between gap-4 border-t pt-6 sm:gap-6 sm:pt-8 md:flex-row',
            designContract.surfaces.shellHairlineInner,
          )}
        >
          <div className={cn('flex flex-wrap justify-center gap-x-6 gap-y-3', designContract.typography.label)}>
            <a
              href='mailto:jostein.oygarden@gmail.com'
              className='flex items-center gap-1.5 font-bold text-slate-300 underline decoration-white/18 underline-offset-4 transition-colors hover:text-slate-50 hover:decoration-white/30'
            >
              <Mail size={12} /> Contact
            </a>
            <a
              href='/gpl-3.0.txt'
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-1.5 font-bold text-slate-300 underline decoration-white/18 underline-offset-4 transition-colors hover:text-slate-50 hover:decoration-white/30'
            >
              <FileText size={12} /> License
            </a>
            <a
              href='/privacy-policy'
              className='flex items-center gap-1.5 font-bold text-slate-300 underline decoration-white/18 underline-offset-4 transition-colors hover:text-slate-50 hover:decoration-white/30'
            >
              <ShieldCheck size={12} /> Privacy
            </a>
            <a
              href='/donate'
              className='flex items-center gap-1.5 font-bold text-slate-300 underline decoration-white/18 underline-offset-4 transition-colors hover:text-slate-50 hover:decoration-white/30'
            >
              <Heart size={12} /> Donate
            </a>
          </div>
          <p className={cn('text-center text-[9px] select-none', designContract.typography.label)}>
            Buldreinfo / Bratte Linjer &copy; 2003-{currYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
