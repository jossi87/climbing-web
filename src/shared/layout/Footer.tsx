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
import { twInk } from '../../design/twInk';

/** Footer grid column titles — a step brighter and larger than default {@link SectionLabel} for `bg-surface-nav`. */
const footerColumnHeadingClass =
  'text-[12px] font-semibold tracking-[0.12em] text-slate-400 uppercase sm:text-[13px] sm:tracking-[0.1em] sm:text-slate-300';

/** Under nav card titles — clearly subordinate: smaller than title, normal weight, muted (not {@link designContract.typography.label} / `type-label`, which was 13px semibold uppercase). */
const navCardSubtitleClass =
  'block text-[10px] font-normal leading-snug tracking-normal text-slate-500 sm:text-[11px] light:text-slate-600';

/** Legal links + copyright: one step under default `type-label` (12px); shared scale so the row matches the line below. */
const footerLegalTextClass = cn(designContract.typography.label, 'text-[11px] leading-tight sm:text-[12px]');

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
            'bg-surface-raised group-hover:border-brand-border/50 light:border-slate-400/60 light:group-hover:border-slate-500/80 light:group-hover:shadow-none flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600/45 text-slate-400 transition-[color,border-color,box-shadow] duration-200 group-hover:text-slate-100 group-hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] sm:h-9 sm:w-9',
            twInk.lightGroupHoverSlate800,
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
          <span
            className={cn(
              'light:group-hover:text-slate-950 block text-[12px] font-semibold text-slate-200 transition-colors duration-200 sm:text-[13px]',
              twInk.groupHoverChromeNearWhite,
            )}
          >
            {title}
          </span>
          {subtitle && <span className={navCardSubtitleClass}>{subtitle}</span>}
        </div>
      </>
    );

    const baseClass = cn(
      'group flex max-sm:-mx-1 max-sm:px-1.5 items-center gap-3 rounded-lg px-2 py-1.5 text-slate-400 transition-[color,background-color] duration-200 hover:bg-white/[0.07] hover:text-slate-100 light:hover:bg-slate-300/60',
      twInk.lightHoverSlate900,
    );

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
              className={cn(
                'group light:hover:bg-slate-300/60 flex items-center gap-3 rounded-lg px-2 py-1.5 text-slate-400 transition-[color,background-color] duration-200 hover:bg-white/[0.07] hover:text-slate-100 max-sm:-mx-1 max-sm:px-1.5',
                twInk.lightHoverSlate900,
              )}
            >
              <div
                className={cn(
                  'bg-surface-raised group-hover:border-brand-border/50 light:border-slate-400/60 light:group-hover:border-slate-500/80 light:group-hover:shadow-none flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600/45 text-slate-400 transition-[color,border-color,box-shadow] duration-200 group-hover:text-slate-100 group-hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] sm:h-9 sm:w-9',
                  twInk.lightGroupHoverSlate800,
                )}
              >
                <img
                  src='/png/brv.png'
                  alt='BRV'
                  className='footer-brv-logo h-5 w-5 border-0 object-contain transition-all outline-none'
                />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span
                  className={cn(
                    'light:group-hover:text-slate-950 block text-[12px] font-semibold text-slate-200 transition-colors duration-200 sm:text-[13px]',
                    twInk.groupHoverChromeNearWhite,
                  )}
                >
                  BRV
                </span>
                <span className={navCardSubtitleClass}>Bratte Rogalands Venner</span>
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
          <div
            className={cn(
              'flex max-w-full min-w-0 flex-nowrap items-center justify-center gap-x-1 sm:gap-x-3 md:gap-x-5',
              footerLegalTextClass,
            )}
          >
            <a
              href='mailto:jostein.oygarden@gmail.com'
              className='hover:text-brand hover:decoration-brand/55 light:text-slate-600 light:decoration-slate-400/55 light:hover:bg-slate-300/55 light:hover:decoration-brand/60 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-bold text-slate-300 underline decoration-white/22 underline-offset-[3px] transition-[color,background-color,text-decoration-color] duration-200 hover:bg-white/[0.07] sm:px-1.5'
            >
              <Mail className='h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5' strokeWidth={2} /> Contact
            </a>
            <a
              href='/gpl-3.0.txt'
              target='_blank'
              rel='noreferrer'
              className='hover:text-brand hover:decoration-brand/55 light:text-slate-600 light:decoration-slate-400/55 light:hover:bg-slate-300/55 light:hover:decoration-brand/60 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-bold text-slate-300 underline decoration-white/22 underline-offset-[3px] transition-[color,background-color,text-decoration-color] duration-200 hover:bg-white/[0.07] sm:px-1.5'
            >
              <FileText className='h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5' strokeWidth={2} /> License
            </a>
            <a
              href='/privacy-policy'
              className='hover:text-brand hover:decoration-brand/55 light:text-slate-600 light:decoration-slate-400/55 light:hover:bg-slate-300/55 light:hover:decoration-brand/60 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-bold text-slate-300 underline decoration-white/22 underline-offset-[3px] transition-[color,background-color,text-decoration-color] duration-200 hover:bg-white/[0.07] sm:px-1.5'
            >
              <ShieldCheck className='h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5' strokeWidth={2} /> Privacy
            </a>
            <a
              href='/donate'
              className='hover:text-brand hover:decoration-brand/55 light:text-slate-600 light:decoration-slate-400/55 light:hover:bg-slate-300/55 light:hover:decoration-brand/60 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 font-bold text-slate-300 underline decoration-white/22 underline-offset-[3px] transition-[color,background-color,text-decoration-color] duration-200 hover:bg-white/[0.07] sm:px-1.5'
            >
              <Heart className='h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5' strokeWidth={2} /> Donate
            </a>
          </div>
          <p className={cn('text-center select-none', footerLegalTextClass)}>
            Buldreinfo / Bratte Linjer &copy; 2003-{currYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
