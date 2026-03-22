import { Link } from 'react-router-dom';
import { useMeta } from './common/meta/context';
import { useData } from '../api';
import { ClickableAvatar } from './ui/Avatar';
import {
  Info,
  Users,
  Pencil,
  Book,
  Mail,
  Camera,
  Code,
  Globe,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import type { Success } from '../@types/buldreinfo';
import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  icon: LucideIcon;
  subheader?: string;
  children: ReactNode;
  className?: string;
};

const About = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getAdministrators'>>(`/administrators`);

  const Section = ({ title, icon: Icon, subheader, children, className = '' }: SectionProps) => (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm overflow-hidden ${className}`}
    >
      <div className='flex items-start gap-4 mb-6'>
        <div className='p-2.5 bg-surface-nav rounded-lg border border-surface-border text-slate-300 shadow-inner'>
          <Icon size={20} />
        </div>
        <div>
          <h3 className='text-xl font-bold text-white tracking-tight'>{title}</h3>
          {subheader && (
            <p className='text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest italic'>
              {subheader}
            </p>
          )}
        </div>
      </div>
      <div className='text-sm text-slate-300 leading-relaxed'>{children}</div>
    </div>
  );

  return (
    <div className='max-w-container mx-auto px-4 py-8'>
      <title>{`About | ${meta?.title}`}</title>
      <meta name='description' content='History, information and administrators.' />

      <div className='grid grid-cols-1 gap-8 items-start'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='space-y-8'>
            <Section
              title='Statutes'
              icon={Info}
              subheader='A nonprofit website created by climbers, for climbers.'
            >
              <ul className='space-y-4'>
                {[
                  <span key='author'>
                    The webpage is created and maintained by{' '}
                    <a
                      href='mailto:jostein.oygarden@gmail.com'
                      className='text-slate-200 hover:text-brand transition-colors font-bold'
                    >
                      Jostein Øygarden
                    </a>
                    .
                  </span>,
                  'The aim and purpose of the websites is to create a solution that provides as good information as possible about the climbing in the region, also called a climbing guide.',
                  'The site is non-profit and free to use for everyone.',
                  'The editors are a variety of active climbers in the different regions.',
                  'The owner of the content is linked to the origin, whether it is a club or individuals.',
                ].map((content, i) => (
                  <li key={i} className='flex gap-3'>
                    <div className='h-1.5 w-1.5 rounded-full bg-slate-600 mt-2 shrink-0' />
                    <span>{content}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              title='Collaboration'
              icon={Heart}
              subheader='Collective work of the community.'
            >
              <div className='space-y-4'>
                <p>
                  Contact{' '}
                  <a
                    href='mailto:jostein.oygarden@gmail.com'
                    className='text-slate-200 hover:text-brand transition-colors font-bold'
                  >
                    Jostein
                  </a>{' '}
                  if you want to establish your own online guidebook.
                </p>
                <div className='bg-surface-nav border border-surface-border rounded-lg p-4 text-xs text-slate-400'>
                  The yearly cost for a page (as of 2026) is 250,- NOK per page and covers the
                  hosting fee. One page is defined as one topo/guide.
                </div>
              </div>
            </Section>

            <Section
              title='Ethics'
              icon={Pencil}
              subheader='Guidelines for an excellent experience.'
            >
              <ul className='space-y-3'>
                {[
                  'Show respect for landowners.',
                  'Follow paths.',
                  'Take trash back.',
                  'Park with reason.',
                  'No chipping.',
                  'Climbing involves risk.',
                ].map((text, i) => (
                  <li key={i} className='flex gap-3'>
                    <div className='h-1.5 w-1.5 rounded-full bg-slate-600 mt-2 shrink-0' />
                    <span>{text}</span>
                  </li>
                ))}
                {meta.isBouldering ? (
                  <li className='flex gap-3'>
                    <div className='h-1.5 w-1.5 rounded-full bg-slate-600 mt-2 shrink-0' />
                    <span>Sit start means behind leaves the ground last.</span>
                  </li>
                ) : (
                  <li className='flex gap-3'>
                    <div className='h-1.5 w-1.5 rounded-full bg-slate-600 mt-2 shrink-0' />
                    <span>Tighten loose hangers (17mm spanner).</span>
                  </li>
                )}
              </ul>
            </Section>
          </div>

          <div className='space-y-8'>
            <Section
              title='History'
              icon={Book}
              subheader='The first version was published in 2003.'
            >
              <div className='space-y-6'>
                {[
                  {
                    year: '2023',
                    url: 'github.com/jossi87',
                    desc: 'The project is now open source.',
                    links: [
                      {
                        label: 'Frontend: climbing-web',
                        href: 'https://github.com/jossi87/climbing-web',
                        icon: Code,
                      },
                      {
                        label: 'Backend: climbing-ws',
                        href: 'https://github.com/jossi87/climbing-ws',
                        icon: Code,
                      },
                    ],
                  },
                  {
                    year: '2021',
                    url: 'is.brattelinjer.no',
                    desc: 'Ice climbing guide, by Jostein Øygarden',
                    img: '20211012_is_brattelinjer.png',
                  },
                  {
                    year: '2018',
                    url: 'brattelinjer.no',
                    desc: 'Sport- and traditional climbing guide, by Jostein Øygarden',
                    img: '20211012_brattelinjer.png',
                  },
                  {
                    year: '2016',
                    url: 'buldreinfo.com',
                    desc: 'Bouldering guide, by Jostein Øygarden',
                    img: '20211012_buldreinfo.png',
                  },
                  {
                    year: '2012-2016',
                    url: 'buldreinfo.com',
                    desc: 'Bouldering guide, by Idar Ose',
                    img: '20160205_buldreinfo.png',
                    archive:
                      'https://web.archive.org/web/20160205060357/http://www.buldreinfo.com/',
                  },
                  {
                    year: '2006-2012',
                    url: 'buldreinfo.com',
                    desc: 'Bouldering guide, by Vegard Aksnes',
                    img: '20110923_buldreinfo.png',
                    img2: '20071104_buldreinfo.png',
                    archive:
                      'https://web.archive.org/web/20110923004804/http://www.buldreinfo.com/',
                  },
                  {
                    year: '2003-2006',
                    url: 'brv.no',
                    desc: 'Bouldering guide predecessor, by Vegard Aksnes',
                    img: '20040812_brv_bouldering_guide.png',
                    archive:
                      'https://web.archive.org/web/20050308114436/http://www.brv.no/gammelt/buldring/oversikt.htm',
                  },
                ].map((item, idx) => (
                  <div key={idx} className='border-l border-surface-border pl-4'>
                    <div className='flex items-baseline gap-2'>
                      <span className='font-bold text-white text-sm'>{item.year}:</span>
                      {item.links ? (
                        <span className='text-sm text-slate-300 font-bold'>Open Source</span>
                      ) : (
                        <a
                          href={`https://${item.url}`}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm text-slate-300 hover:text-white underline'
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                    <p className='text-xs text-slate-500 mt-1'>{item.desc}</p>
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {item.links?.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.href}
                          target='_blank'
                          rel='noreferrer'
                          className='flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[10px] text-slate-400 hover:text-white transition-colors'
                        >
                          <link.icon size={12} /> {link.label}
                        </a>
                      ))}
                      {item.img && (
                        <a
                          href={`/png/archive/${item.img}`}
                          target='_blank'
                          rel='noreferrer'
                          className='flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[10px] text-slate-400 hover:text-white transition-colors'
                        >
                          <Camera size={12} /> Screenshot{' '}
                          {item.year === '2006-2012' ? '(2011.09.23)' : ''}
                        </a>
                      )}
                      {item.img2 && (
                        <a
                          href={`/png/archive/${item.img2}`}
                          target='_blank'
                          rel='noreferrer'
                          className='flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[10px] text-slate-400 hover:text-white transition-colors'
                        >
                          <Camera size={12} /> Screenshot (2007.11.04)
                        </a>
                      )}
                      {item.archive && (
                        <a
                          href={item.archive}
                          target='_blank'
                          rel='noreferrer'
                          className='flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[10px] text-slate-400 hover:text-white transition-colors'
                        >
                          <Globe size={12} /> source: archive.net
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        <Section
          title='Administrators'
          icon={Users}
          subheader={data ? `${data.length} users` : 'Loading...'}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {data?.map((u) => (
              <div
                key={u.userId}
                className='flex gap-4 p-4 rounded-lg bg-surface-nav/30 border border-surface-border/50 group hover:border-brand/30 transition-colors'
              >
                <ClickableAvatar
                  name={u.name}
                  mediaId={u.mediaId}
                  mediaVersionStamp={u.mediaVersionStamp}
                  size='tiny'
                />
                <div className='min-w-0 flex-1'>
                  <Link
                    to={`/user/${u.userId}`}
                    className='text-white font-bold hover:text-brand transition-colors text-sm truncate block'
                  >
                    {u.name}
                  </Link>
                  <div className='text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5'>
                    Last seen {u.lastLogin}
                  </div>
                  <div className='flex flex-col gap-2 mt-3'>
                    {u.emails?.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className='flex items-center gap-2 text-xs text-slate-400 hover:text-brand transition-colors truncate'
                      >
                        <Mail size={14} className='shrink-0' />
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default About;
