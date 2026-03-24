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

const Footer = () => {
  const { isBouldering } = useMeta();
  const currYear = new Date().getFullYear();

  return (
    <footer className='w-full bg-surface-nav border-t border-surface-border mt-12 sm:mt-20 py-10 sm:py-20'>
      <div className='max-w-container mx-auto px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16'>
          <div className='space-y-4'>
            <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
              Navigation
            </span>
            <div className='flex flex-col gap-2'>
              {[
                { to: '/about', icon: Info, label: 'About' },
                ...(!isBouldering
                  ? [{ to: '/dangerous', icon: AlertTriangle, label: 'Dangerous' }]
                  : []),
                { to: '/graph', icon: BarChart3, label: 'Graph' },
                { to: '/webcams', icon: Camera, label: 'Webcams' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => window.scrollTo(0, 0)}
                  className='flex items-center gap-4 text-slate-300 hover:text-brand transition-colors group'
                >
                  <div className='rounded-lg bg-surface-card border border-surface-border group-hover:border-brand/50 transition-colors shrink-0 flex items-center justify-center w-10.5 h-10.5'>
                    <item.icon size={18} />
                  </div>
                  <span className='text-sm font-bold block text-slate-100 group-hover:text-brand transition-colors'>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
              Open Source Stack
            </span>
            <div className='flex flex-col gap-2'>
              {[
                {
                  href: 'https://github.com/jossi87/climbing-web',
                  icon: Code2,
                  title: 'Frontend',
                  sub: 'React / TS',
                },
                {
                  href: 'https://github.com/jossi87/climbing-ws',
                  icon: Coffee,
                  title: 'Backend API',
                  sub: 'Java REST',
                },
                {
                  href: 'https://github.com/jossi87/climbing-leaflet-renderer',
                  icon: FileDown,
                  title: 'PDF Maps',
                  sub: 'Leaflet',
                },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target='_blank'
                  rel='noreferrer noopener'
                  className='flex items-center gap-4 text-slate-300 hover:text-brand transition-colors group'
                >
                  <div className='rounded-lg bg-surface-card border border-surface-border group-hover:border-brand/50 transition-colors shrink-0 flex items-center justify-center w-10.5 h-10.5'>
                    <item.icon size={18} />
                  </div>
                  <div className='flex flex-col text-left'>
                    <span className='text-sm font-bold block text-slate-100 group-hover:text-brand transition-colors'>
                      {item.title}
                    </span>
                    <span className='text-[9px] text-slate-500 block leading-tight'>
                      {item.sub}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
              Affiliation
            </span>
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='flex items-center gap-4 text-slate-300 hover:text-brand transition-colors group'
            >
              <div className='rounded-lg bg-surface-card border border-surface-border group-hover:border-brand/50 transition-colors shrink-0 flex items-center justify-center w-10.5 h-10.5'>
                <img
                  src='/png/brv.png'
                  alt='BRV'
                  className='w-6 h-6 object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-all'
                />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span className='text-sm font-bold block text-slate-100 group-hover:text-brand transition-colors'>
                  BRV
                </span>
                <span className='text-[9px] text-slate-500 block leading-tight'>
                  Bratte Rogalands Venner
                </span>
              </div>
            </a>
          </div>

          <div className='space-y-4'>
            <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>
              Community
            </span>
            <a
              href='https://www.facebook.com/groups/brattelinjer'
              rel='noreferrer noopener'
              target='_blank'
              className='flex items-center gap-4 text-slate-300 hover:text-facebook transition-colors group'
            >
              <div className='rounded-lg bg-surface-card border border-surface-border group-hover:border-facebook/50 transition-colors shrink-0 flex items-center justify-center w-10.5 h-10.5'>
                <Facebook size={18} />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span className='text-sm font-bold block text-slate-100 group-hover:text-facebook transition-colors'>
                  Bratte Linjer
                </span>
                <span className='text-[9px] text-slate-500 block leading-tight'>
                  Facebook Discussion
                </span>
              </div>
            </a>
          </div>
        </div>

        <div className='pt-8 border-t border-surface-border/50 flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-wider text-slate-600'>
            <a
              href={`mailto:jostein.oygarden@gmail.com`}
              className='hover:text-brand flex items-center gap-1.5'
            >
              <Mail size={13} /> Contact
            </a>
            <a
              href='/gpl-3.0.txt'
              target='_blank'
              className='hover:text-brand flex items-center gap-1.5'
            >
              <FileText size={13} /> License
            </a>
            <Link
              to='/privacy-policy'
              onClick={() => window.scrollTo(0, 0)}
              className='hover:text-brand flex items-center gap-1.5'
            >
              <ShieldCheck size={13} /> Privacy Policy
            </Link>
          </div>
          <p className='text-[9px] text-slate-700 uppercase tracking-[0.2em] font-black text-center'>
            Buldreinfo &copy; 2003-{currYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
