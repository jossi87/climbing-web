import { type ElementType } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
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
} from 'lucide-react';
import { useMeta } from './common/meta/context';
import { SectionLabel, TextLink } from './ui';
import { cn } from '../lib/utils';

type NavCardProps = {
  to?: string;
  href?: string;
  icon: ElementType;
  title: string;
  subtitle?: string;
  className?: string;
};

const Footer = () => {
  const { isBouldering } = useMeta();
  const currYear = new Date().getFullYear();

  const NavCard = ({ to, href, icon: Icon, title, subtitle, className }: NavCardProps) => {
    const content = (
      <>
        <div
          className={cn(
            'rounded bg-white/5 border border-white/10 group-hover:border-brand/40 transition-colors shrink-0 flex items-center justify-center w-9 h-9 text-slate-400 group-hover:text-brand',
            className,
          )}
        >
          <Icon size={16} />
        </div>
        <div className='flex flex-col text-left'>
          <span className='text-[13px] font-bold block text-slate-200 group-hover:text-brand transition-colors'>
            {title}
          </span>
          {subtitle && (
            <span className='text-[9px] text-slate-500 block leading-tight font-medium uppercase tracking-tight'>
              {subtitle}
            </span>
          )}
        </div>
      </>
    );

    const baseClass =
      'flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors group';

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
    <footer className='w-full bg-surface-nav border-t border-surface-border mt-12 sm:mt-20 py-10 sm:py-16'>
      <div className='max-w-container mx-auto px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 sm:mb-16'>
          <div className='space-y-4'>
            <SectionLabel className='text-slate-500'>Navigation</SectionLabel>
            <div className='flex flex-col gap-3'>
              <NavCard to='/about' icon={Info} title='About' />
              {!isBouldering && <NavCard to='/dangerous' icon={AlertTriangle} title='Dangerous' />}
              <NavCard to='/graph' icon={BarChart3} title='Graph' />
              <NavCard to='/webcams' icon={Camera} title='Webcams' />
            </div>
          </div>

          <div className='space-y-4'>
            <SectionLabel className='text-slate-500'>Open Source Stack</SectionLabel>
            <div className='flex flex-col gap-3'>
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

          <div className='space-y-4'>
            <SectionLabel className='text-slate-500'>Affiliation</SectionLabel>
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors group'
            >
              <div className='rounded bg-white/5 border border-white/10 group-hover:border-brand/40 transition-colors shrink-0 flex items-center justify-center w-9 h-9'>
                <img
                  src='/png/brv.png'
                  alt='BRV'
                  className='w-5 h-5 object-contain brightness-0 invert opacity-40 group-hover:opacity-100 transition-all'
                />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span className='text-[13px] font-bold block text-slate-200 group-hover:text-brand transition-colors'>
                  BRV
                </span>
                <span className='text-[9px] text-slate-500 block leading-tight font-medium uppercase tracking-tight'>
                  Bratte Rogalands Venner
                </span>
              </div>
            </a>
          </div>

          <div className='space-y-4'>
            <SectionLabel className='text-slate-500'>Community</SectionLabel>
            <NavCard
              href='https://www.facebook.com/groups/brattelinjer'
              icon={Facebook}
              title='Bratte Linjer'
              subtitle='Facebook Discussion'
              className='group-hover:border-facebook/40 text-slate-400'
            />
          </div>
        </div>

        <div className='pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
            <TextLink href='mailto:jostein.oygarden@gmail.com' external={false}>
              <span className='flex items-center gap-1.5'>
                <Mail size={12} /> Contact
              </span>
            </TextLink>
            <TextLink href='/gpl-3.0.txt'>
              <span className='flex items-center gap-1.5'>
                <FileText size={12} /> License
              </span>
            </TextLink>
            <TextLink href='/privacy-policy' external={false}>
              <span className='flex items-center gap-1.5'>
                <ShieldCheck size={12} /> Privacy
              </span>
            </TextLink>
          </div>
          <p className='text-[9px] text-slate-700 uppercase tracking-[0.3em] font-black text-center select-none'>
            Buldreinfo &copy; 2003-{currYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
