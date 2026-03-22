import { Link } from 'react-router-dom';
import {
  Facebook,
  Mail,
  Info,
  ShieldCheck,
  FileText,
  Heart,
  Server,
  FileDown,
  Code2,
} from 'lucide-react';
import { FooterLink } from './ui/FooterLink';

const Footer = () => {
  const currYear = new Date().getFullYear();

  return (
    <footer className='w-full bg-surface-nav border-t border-surface-border mt-20 py-16'>
      <div className='max-w-container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12 mb-12'>
          <div className='flex flex-col items-center md:items-start gap-4'>
            <span className='text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]'>
              The Stack (Open Source)
            </span>
            <div className='flex flex-col gap-3 w-full max-w-footer-stack'>
              <FooterLink
                href='https://github.com/jossi87/climbing-web'
                icon={Code2}
                title='Frontend'
                subtitle='climbing-web'
              />
              <FooterLink
                href='https://github.com/jossi87/climbing-ws'
                icon={Server}
                title='Backend API'
                subtitle='climbing-ws'
              />
              <FooterLink
                href='https://github.com/jossi87/climbing-leaflet-renderer'
                icon={FileDown}
                title='PDF Map Generator'
                subtitle='climbing-leaflet-renderer'
              />
            </div>
          </div>

          <div className='flex flex-col items-center gap-4'>
            <span className='text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]'>
              Affiliation
            </span>
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='flex items-center gap-4 text-slate-300 hover:text-brand transition-colors group mt-2'
            >
              <div className='p-3 rounded-md bg-surface-card border border-surface-border group-hover:border-brand/50 transition-colors'>
                <img
                  src='/png/brv.png'
                  alt='BRV'
                  className='w-8 h-8 grayscale group-hover:grayscale-0 transition-all'
                />
              </div>
              <div className='flex flex-col items-start text-left'>
                <span className='text-sm font-bold leading-none text-white group-hover:text-brand'>
                  Bratte Rogalands Venner
                </span>
                <span className='text-[10px] text-slate-500 max-w-35'>
                  Supporting the local climbing community since 1980
                </span>
              </div>
            </a>
          </div>

          <div className='flex flex-col items-center md:items-end gap-4'>
            <span className='text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]'>
              Community
            </span>
            <a
              href='https://www.facebook.com/groups/brattelinjer'
              rel='noreferrer noopener'
              target='_blank'
              className='flex items-center gap-3 text-slate-300 hover:text-facebook transition-colors group'
            >
              <div className='p-2 rounded-md bg-surface-card border border-surface-border group-hover:border-facebook/50 transition-colors'>
                <Facebook size={20} />
              </div>
              <div className='flex flex-col items-start md:items-end text-left md:text-right'>
                <span className='text-sm font-bold leading-none text-white group-hover:text-facebook'>
                  Bratte Linjer
                </span>
                <span className='text-[10px] text-slate-500'>Facebook Discussion</span>
              </div>
            </a>
          </div>
        </div>

        <div className='h-px bg-surface-border w-full mb-8' />

        <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
          <div className='flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-[11px] font-bold uppercase tracking-wider text-slate-500'>
            <Link
              to='/about'
              className='hover:text-white transition-colors flex items-center gap-2'
            >
              <Info size={14} className='text-slate-600' /> About
            </Link>

            <a
              href={`mailto:jostein.oygarden@gmail.com?subject=${window.location.href}`}
              className='hover:text-white transition-colors flex items-center gap-2'
            >
              <Mail size={14} className='text-slate-600' /> Contact
            </a>

            <Link
              to='/donations'
              className='hover:text-brand transition-colors flex items-center gap-2'
            >
              <Heart size={14} className='text-brand/60' /> Donate
            </Link>

            <a
              href='/gpl-3.0.txt'
              rel='noreferrer noopener'
              target='_blank'
              className='hover:text-white transition-colors flex items-center gap-2'
            >
              <FileText size={14} className='text-slate-600' /> License
            </a>

            <Link
              to='/privacy-policy'
              className='hover:text-white transition-colors flex items-center gap-2'
            >
              <ShieldCheck size={14} className='text-slate-600' /> Privacy
            </Link>
          </div>

          <div className='text-center md:text-right'>
            <p className='text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold'>
              Buldreinfo &amp; Bratte Linjer &copy; 2003-{currYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
