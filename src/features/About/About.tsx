import { useTranslation, Trans } from 'react-i18next';
import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import { Flag, FileText, Info, Users, Pencil, Book, Code, Globe, Heart, Camera, ExternalLink } from 'lucide-react';
import type { Success } from '../../@types/buldreinfo';
import {
  BRV_PLATFORM_AGREEMENT_DATE_LABEL,
  BRV_PLATFORM_AGREEMENT_PDF,
  BRV_WEBSITE_URL,
} from '../../constants/legalLinks';
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

/**
 * The maintainer's mailto link, defined once and handed to each `<Trans>` as its `link` slot: three sentences mention it,
 * and the visible name stays inside the catalog sentence (see `about.statutes.createdBy`). `children` stays empty here
 * because `<Trans>` supplies the translated text when it clones the slot.
 */
const maintainerLink = <TextLink href='mailto:jostein.oygarden@gmail.com' children={null} />;

const About = () => {
  const meta = useMeta();
  const { t } = useTranslation();
  const { data } = useData<Success<'getAdministrators'>>(`/administrators`);
  const adminCount = data?.length;
  const adminSubheader = adminCount !== undefined ? t('about.administrators.count', { count: adminCount }) : undefined;

  return (
    <>
      <title>{t('meta.pageTitle', { page: t('about.history.title'), site: meta?.title ?? '' })}</title>
      <meta name='description' content={t('about.pageDescription')} />

      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Card>
            <SectionHeader title={t('about.statutes.title')} icon={Info} subheader={t('about.statutes.subheader')} />
            <List>
              <ListItem>
                <Trans i18nKey='about.statutes.createdBy' components={{ link: maintainerLink }} />
              </ListItem>
              <ListItem>{t('about.statutes.aim')}</ListItem>
              <ListItem>{t('about.statutes.nonProfit')}</ListItem>
              <ListItem>{t('about.statutes.editors')}</ListItem>
              <ListItem>{t('about.statutes.ownership')}</ListItem>
            </List>
          </Card>

          <Card>
            <SectionHeader
              title={t('about.collaboration.title')}
              icon={Heart}
              subheader={t('about.collaboration.subheader')}
            />
            <List>
              <ListItem>
                <Trans i18nKey='about.collaboration.contact' components={{ link: maintainerLink }} />
              </ListItem>
              <ListItem>
                <Trans
                  i18nKey='about.collaboration.hostingFee'
                  components={{ amount: <span className='font-semibold text-slate-200' /> }}
                />
              </ListItem>
              <ListItem>
                <Trans
                  i18nKey='about.collaboration.brvAgreement'
                  values={{ date: BRV_PLATFORM_AGREEMENT_DATE_LABEL }}
                  components={{
                    brv: <TextLink href={BRV_WEBSITE_URL} children={null} />,
                    pdf: (
                      <TextLink href={BRV_PLATFORM_AGREEMENT_PDF} title={t('about.collaboration.norwegianPdf')}>
                        <span className='inline-flex items-center gap-1'>
                          {t('about.collaboration.readPdf')}
                          <FileText className='h-3.5 w-3.5 shrink-0 opacity-90' strokeWidth={2} aria-hidden />
                        </span>
                      </TextLink>
                    ),
                  }}
                />
              </ListItem>
            </List>
          </Card>

          <Card>
            <SectionHeader title={t('about.ethics.title')} icon={Pencil} subheader={t('about.ethics.subheader')} />
            <List>
              <ListItem>{t('about.ethics.respectLandowners')}</ListItem>
              <ListItem>{t('about.ethics.followPaths')}</ListItem>
              <ListItem>{t('about.ethics.takeTrash')}</ListItem>
              <ListItem>{t('about.ethics.noChipping')}</ListItem>
              <ListItem>{t('about.ethics.risk')}</ListItem>
              <ListItem>{t(meta.isBouldering ? 'about.ethics.sitStart' : 'about.ethics.tightenHangers')}</ListItem>
            </List>
          </Card>

          <Card>
            <SectionHeader
              title={t('about.moderation.title')}
              icon={Flag}
              subheader={t('about.moderation.subheader')}
            />
            <List>
              <ListItem>
                <Trans i18nKey='about.moderation.reportErrors' components={{ link: maintainerLink }} />
              </ListItem>
              <ListItem>{t('about.moderation.namesTrivia')}</ListItem>
              <ListItem>
                <Trans
                  i18nKey='about.moderation.namingGuidance'
                  components={{
                    link: (
                      <TextLink
                        href='https://klatring.no/siteassets/dokumenter/klatrefelt-og-anlegg/klatrefelt/2022-retningslinjer-for-rutenavn-.pdf'
                        children={null}
                      />
                    ),
                    icon: <ExternalLink className='inline h-3 w-3' />,
                  }}
                />
              </ListItem>
              <ListItem>
                <Trans i18nKey='about.moderation.reportOffensive' components={{ link: maintainerLink }} />
              </ListItem>
            </List>
          </Card>
        </div>

        <Card>
          <SectionHeader title={t('about.history.title')} icon={Book} subheader={t('about.history.subheader')} />
          <Timeline>
            <TimelineItem
              year='2026'
              title={t('about.history.redesignTitle')}
              description={t('about.history.redesignDescription')}
            >
              <Badge href='/png/archive/20260514_brattelinjer_dark.png' icon={Camera}>
                {t('about.history.screenshotDark')}
              </Badge>
              <Badge href='/png/archive/20260514_brattelinjer_light.png' icon={Camera}>
                {t('about.history.screenshotLight')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2023' title='github.com/jossi87' description={t('about.history.openSource')}>
              <Badge href='https://github.com/jossi87/climbing-web' icon={Code}>
                {t('about.history.frontend')}
              </Badge>
              <Badge href='https://github.com/jossi87/climbing-ws' icon={Code}>
                {t('about.history.backend')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2021' title='is.brattelinjer.no' description={t('about.history.iceGuide')}>
              <Badge href='/png/archive/20211012_is_brattelinjer.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2018' title='brattelinjer.no' description={t('about.history.sportTradGuide')}>
              <Badge href='/png/archive/20211012_brattelinjer.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2016' title='buldreinfo.com' description={t('about.history.boulderingGuideJostein')}>
              <Badge href='/png/archive/20211012_buldreinfo.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2012-2016' title='buldreinfo.com' description={t('about.history.boulderingGuideIdar')}>
              <Badge href='/png/archive/20160205_buldreinfo.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
              <Badge href='https://web.archive.org/web/20160205060357/http://www.buldreinfo.com/' icon={Globe}>
                {t('about.history.archive')}
              </Badge>
            </TimelineItem>

            <TimelineItem
              year='2006-2012'
              title='buldreinfo.com'
              description={t('about.history.boulderingGuideVegard')}
            >
              <Badge href='/png/archive/20110923_buldreinfo.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
              <Badge href='https://web.archive.org/web/20110923004804/http://www.buldreinfo.com/' icon={Globe}>
                {t('about.history.archive')}
              </Badge>
            </TimelineItem>

            <TimelineItem year='2003-2006' title='brv.no' description={t('about.history.boulderingGuidePredecessor')}>
              <Badge href='/png/archive/20040812_brv_bouldering_guide.png' icon={Camera}>
                {t('about.history.screenshot')}
              </Badge>
              <Badge
                href='https://web.archive.org/web/20050308114436/http://www.brv.no/gammelt/buldring/oversikt.htm'
                icon={Globe}
              >
                {t('about.history.archive')}
              </Badge>
            </TimelineItem>
          </Timeline>
        </Card>

        <Card className='lg:col-span-2'>
          <SectionHeader
            title={t('about.administrators.title')}
            icon={Users}
            subheader={adminSubheader ?? t('about.administrators.subheader')}
          />
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
