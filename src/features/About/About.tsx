import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import { Info, Users, Pencil, Book, Code, Globe, Heart, Camera } from 'lucide-react';
import type { Success } from '../../@types/buldreinfo';
import {
  Card,
  Badge,
  SectionHeader,
  List,
  ListItem,
  UserCard,
  Timeline,
  TimelineItem,
  TextLink,
} from '../../shared/ui';

const About = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getAdministrators'>>(`/administrators`);

  const adminCount = data?.length;
  const adminSubheader = adminCount !== undefined ? `${adminCount} Regional Admins` : 'Regional Admins';

  return (
    <>
      <title>{`About | ${meta?.title}`}</title>
      <meta name='description' content='History, information and administrators' />

      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Card>
            <SectionHeader
              title='Statutes'
              icon={Info}
              subheader='A nonprofit website created by climbers, for climbers'
            />
            <List>
              <ListItem>
                The webpage is created and maintained by{' '}
                <TextLink href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</TextLink>
              </ListItem>
              <ListItem>The aim is to provide the best possible climbing information in the region</ListItem>
              <ListItem>The site is non-profit and free to use for everyone</ListItem>
              <ListItem>The editors are a variety of active climbers in the different regions</ListItem>
              <ListItem>The owner of the content is linked to the origin, club or individual</ListItem>
            </List>
          </Card>

          <Card>
            <SectionHeader title='Collaboration' icon={Heart} subheader='Get your own guide' />
            <div className='space-y-5'>
              <p className='text-sm leading-relaxed text-slate-300'>
                Contact <TextLink href='mailto:jostein.oygarden@gmail.com'>Jostein</TextLink> if you want to establish
                your own online guidebook for your region
              </p>
              <div className='text-sm text-slate-300'>
                The yearly hosting fee (as of 2026) is <span className='font-semibold text-slate-200'>250,- NOK</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title='Ethics' icon={Pencil} subheader='Guidelines for the crag' />
            <List>
              <ListItem>Show respect for landowners</ListItem>
              <ListItem>Follow paths and park with reason</ListItem>
              <ListItem>Take trash back</ListItem>
              <ListItem>No chipping</ListItem>
              <ListItem>Climbing involves risk</ListItem>
              <ListItem>
                {meta.isBouldering
                  ? 'Sit start means feet/behind leave the ground last'
                  : 'Tighten loose hangers (17mm spanner)'}
              </ListItem>
            </List>
          </Card>
        </div>

        <Card>
          <SectionHeader title='History' icon={Book} subheader='First published in 2003' />
          <Timeline>
            <TimelineItem year='2023' title='github.com/jossi87' description='The project is now open source'>
              <Badge href='https://github.com/jossi87/climbing-web' icon={Code}>
                Frontend
              </Badge>
              <Badge href='https://github.com/jossi87/climbing-ws' icon={Code}>
                Backend
              </Badge>
            </TimelineItem>

            <TimelineItem year='2021' title='is.brattelinjer.no' description='Ice climbing guide, by Jostein Øygarden'>
              <Badge href='/png/archive/20211012_is_brattelinjer.png' icon={Camera}>
                Screenshot
              </Badge>
            </TimelineItem>

            <TimelineItem
              year='2018'
              title='brattelinjer.no'
              description='Sport- and traditional climbing guide, by Jostein Øygarden'
            >
              <Badge href='/png/archive/20211012_brattelinjer.png' icon={Camera}>
                Screenshot
              </Badge>
            </TimelineItem>

            <TimelineItem year='2016' title='buldreinfo.com' description='Bouldering guide, by Jostein Øygarden'>
              <Badge href='/png/archive/20211012_buldreinfo.png' icon={Camera}>
                Screenshot
              </Badge>
            </TimelineItem>

            <TimelineItem year='2012-2016' title='buldreinfo.com' description='Bouldering guide, by Idar Ose'>
              <Badge href='/png/archive/20160205_buldreinfo.png' icon={Camera}>
                Screenshot
              </Badge>
              <Badge href='https://web.archive.org/web/20160205060357/http://www.buldreinfo.com/' icon={Globe}>
                Archive
              </Badge>
            </TimelineItem>

            <TimelineItem year='2006-2012' title='buldreinfo.com' description='Bouldering guide, by Vegard Aksnes'>
              <Badge href='/png/archive/20110923_buldreinfo.png' icon={Camera}>
                Screenshot
              </Badge>
              <Badge href='https://web.archive.org/web/20110923004804/http://www.buldreinfo.com/' icon={Globe}>
                Archive
              </Badge>
            </TimelineItem>

            <TimelineItem year='2003-2006' title='brv.no' description='Bouldering guide predecessor, by Vegard Aksnes'>
              <Badge href='/png/archive/20040812_brv_bouldering_guide.png' icon={Camera}>
                Screenshot
              </Badge>
              <Badge
                href='https://web.archive.org/web/20050308114436/http://www.brv.no/gammelt/buldring/oversikt.htm'
                icon={Globe}
              >
                Archive
              </Badge>
            </TimelineItem>
          </Timeline>
        </Card>

        <Card className='lg:col-span-2'>
          <SectionHeader title='Administrators' icon={Users} subheader={adminSubheader} />
          <div className='grid grid-cols-2 gap-1 sm:gap-1.5 lg:grid-cols-3 xl:grid-cols-4'>
            {data?.map((u) => (
              <UserCard key={u.userId} user={u} variant='minimal' />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default About;
