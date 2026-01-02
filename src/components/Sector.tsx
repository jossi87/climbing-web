import { ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProblemList from './common/problem-list';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import { SlopeProfile } from './common/SlopeProfile';
import Top from './common/top/top';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { getDistanceWithUnit } from './common/leaflet/geo-utils';
import Media from './common/media/media';
import Todo from './common/todo/todo';
import GetCenterFromDegrees from '../utils/map-utils';
import {
  Stars,
  LockSymbol,
  Loading,
  ConditionLabels,
  ExternalLinkLabels,
  NoDogsAllowed,
} from './common/widgets/widgets';
import {
  Icon,
  Button,
  Tab,
  TabPane,
  Breadcrumb,
  Table,
  Label,
  List,
  Message,
  Feed,
} from 'semantic-ui-react';
import { useMeta } from './common/meta/context';
import { useSector } from '../api';
import { Slope } from '../@types/buldreinfo';
import { components } from '../@types/buldreinfo/swagger';
import { DownloadButton } from './common/DownloadButton';
import { MarkerDef } from './common/leaflet/markers';
import { Markdown } from './Markdown/Markdown';
import ExpandableText from './ExpandableText/ExpandableText';

type Props = {
  problem: NonNullable<components['schemas']['Sector']['problems']>[number];
};

export const SectorListItem = ({ problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? problem.t?.subType +
      ((problem.numPitches ?? 0) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents =
    problem.numTicks && problem.numTicks + (problem.numTicks == 1 ? ' ascent' : ' ascents');
  let faTypeAscents = problem.fa || '';
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents =
      (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + ascents + ')';
  }
  faTypeAscents = faTypeAscents.trim();
  let backgroundColor = '#ffffff';
  if (problem.ticked) {
    backgroundColor = '#d2f8d2';
  } else if (problem.todo) {
    backgroundColor = '#d2d2f8';
  }
  return (
    <List.Item style={{ backgroundColor }} key={problem.id}>
      <List.Header>
        {problem.danger && <Icon color='red' name='warning' />}
        {`#${problem.nr} `}
        <Link to={`/problem/${problem.id}`}>
          {problem.broken ? <del>{problem.name}</del> : problem.name}
        </Link>{' '}
        {problem.grade}
        <Stars numStars={problem.stars ?? 0} includeStarOutlines={false} />
        {faTypeAscents && <small> {faTypeAscents}</small>}
        <small>
          <i style={{ color: 'gray' }}>
            {' '}
            {problem.broken && <u>{problem.broken} </u>}
            {problem.rock && <>Rock: {problem.rock}. </>}
            {problem.comment}{' '}
          </i>
        </small>
        {problem.coordinates && <Icon size='small' name='map marker alternate' />}
        {problem.hasTopo && <Icon size='small' name='paint brush' />}
        {problem.hasImages && <Icon size='small' color='black' name='photo' />}
        {problem.hasMovies && <Icon size='small' color='black' name='film' />}
        <LockSymbol
          lockedAdmin={!!problem.lockedAdmin}
          lockedSuperadmin={!!problem.lockedSuperadmin}
        />
        {problem.ticked && <Icon size='small' color='green' name='check' />}
        {problem.todo && <Icon size='small' color='blue' name='bookmark' />}
      </List.Header>
    </List.Item>
  );
};

type ProblemType = NonNullable<
  NonNullable<ReturnType<typeof useSector>['data']>['problems']
>[number];

const Sector = () => {
  const { sectorId } = useParams();
  if (!sectorId) {
    throw new Error('Missing sectorId URL param');
  }
  const meta = useMeta();
  const { data: data, error, isLoading, redirectUi } = useSector(+sectorId);

  if (redirectUi) {
    return redirectUi;
  }

  if (error) {
    return (
      <Message
        size='huge'
        style={{ backgroundColor: '#FFF' }}
        icon='meh'
        header='404'
        content={String(error)}
      />
    );
  }

  if (isLoading || !data) {
    return <Loading />;
  }

  const orderableMedia: ComponentProps<typeof Media>['orderableMedia'] = [];
  const carouselMedia: ComponentProps<typeof Media>['carouselMedia'] = [];
  if (data.media?.length) {
    carouselMedia.push(...data.media);
    if (data.media.length > 1) {
      orderableMedia.push(...data.media);
    }
  }
  if (data.triviaMedia?.length) {
    carouselMedia.push(...data.triviaMedia);
    if (data.triviaMedia.length > 1) {
      orderableMedia.push(...data.triviaMedia);
    }
  }
  const isBouldering = meta.isBouldering;
  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> =
    data.problems
      ?.filter(
        (
          p,
        ): p is NonNullable<ProblemType> &
          Required<NonNullable<Pick<ProblemType, 'coordinates'>>> =>
          !!(p.coordinates && p.coordinates.latitude && p.coordinates.longitude),
      )
      ?.map((p) => {
        return {
          coordinates: p.coordinates,
          label: p.nr + ' - ' + p.name + ' [' + p.grade + ']',
          url: '/problem/' + p.id,
          rock: p.rock,
        } satisfies MarkerDef;
      }) ?? [];
  // Only add polygon if problemMarkers=0 or site is showing sport climbing
  const addPolygon = meta.isClimbing || markers.length == 0;
  if (data.parking) {
    markers.push({
      coordinates: data.parking,
      isParking: true,
    });
  }
  const panes = [];

  let topoImages = null;
  if (data.media && data.media.length > 0) {
    let media = data.media;
    if (isBouldering) {
      media = data.media.filter((m) => m.svgs == null || m.svgs.length === 0);
      topoImages = data.media.filter((m) => m.svgs && m.svgs.length !== 0);
    }
    if (media && media.length > 0) {
      panes.push({
        menuItem: { key: 'media', icon: 'image' },
        render: () => (
          <TabPane>
            <Media
              pitches={null}
              media={media}
              orderableMedia={orderableMedia}
              carouselMedia={carouselMedia}
              optProblemId={null}
              showLocation={false}
            />
          </TabPane>
        ),
      });
    }
  }
  if (markers.length > 0 || (data.outline ?? []).length) {
    const defaultCenter =
      data.parking && data.parking.latitude && data.parking.longitude
        ? { lat: data.parking.latitude, lng: data.parking.longitude }
        : meta.defaultCenter;
    const defaultZoom = data.parking ? 15 : meta.defaultZoom;
    let outlines: ComponentProps<typeof Leaflet>['outlines'] = undefined;
    const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];
    if ((data.outline ?? []).length && addPolygon) {
      outlines = [{ url: '/sector/' + data.id, label: data.name, outline: data.outline ?? [] }];
    }

    if ((data.approach?.coordinates ?? []).length) {
      slopes.push({
        backgroundColor: 'lime',
        slope: data.approach as Slope,
        label: getDistanceWithUnit(data.approach as Slope) ?? undefined,
      });
    }
    if ((data.descent?.coordinates ?? []).length) {
      slopes.push({
        backgroundColor: 'purple',
        slope: data.descent as Slope,
        label: getDistanceWithUnit(data.descent as Slope) ?? undefined,
      });
    }
    const uniqueRocks = Array.from(
      new Set(
        data.problems
          ?.filter((p) => p.rock)
          ?.map((p) => p.rock)
          ?.filter((p): p is string => !!p) ?? [],
      ),
    ).sort();
    panes.push({
      menuItem: { key: 'map', icon: 'map' },
      render: () => (
        <TabPane>
          <Leaflet
            key={'sector=' + data.id}
            autoZoom={true}
            height='40vh'
            markers={markers}
            outlines={outlines}
            slopes={slopes}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onMouseClick={undefined}
            onMouseMove={undefined}
            showSatelliteImage={isBouldering}
            clusterMarkers={true}
            rocks={uniqueRocks}
            flyToId={null}
          />
        </TabPane>
      ),
    });
  }
  if (topoImages && topoImages.length > 0) {
    panes.push({
      menuItem: { key: 'topo', icon: 'images' },
      render: () => (
        <TabPane>
          <Media
            pitches={null}
            media={topoImages}
            orderableMedia={orderableMedia}
            carouselMedia={carouselMedia}
            optProblemId={null}
            showLocation={false}
          />
        </TabPane>
      ),
    });
  }
  if ((data.problems ?? []).length) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph' },
      render: () => (
        <TabPane>
          <ChartGradeDistribution idSector={data.id ?? 0} />
        </TabPane>
      ),
    });
    panes.push({
      menuItem: { key: 'top', icon: 'trophy' },
      render: () => (
        <TabPane>
          <Top idArea={0} idSector={data.id ?? 0} />
        </TabPane>
      ),
    });
    panes.push({
      menuItem: { key: 'activity', icon: 'time' },
      render: () => (
        <TabPane>
          <Activity idArea={0} idSector={data.id ?? 0} />
        </TabPane>
      ),
    });
    panes.push({
      menuItem: { key: 'todo', icon: 'bookmark' },
      render: () => (
        <TabPane>
          <Todo idArea={0} idSector={data.id ?? 0} />
        </TabPane>
      ),
    });
  }
  const uniqueTypes = Array.from(
    new Set((data.problems ?? []).map((p) => p.t?.subType).filter((p): p is string => !!p)),
  );
  if ((data.problems ?? []).filter((p) => p.broken)?.length) {
    uniqueTypes.push('Broken');
  }
  if ((data.problems ?? []).filter((p) => p.gradeNumber === 0)?.length) {
    uniqueTypes.push('Projects');
  }
  uniqueTypes.sort();

  const [conditionLat, conditionLng] = (() => {
    const validatedOutline = data?.outline?.filter(
      (
        c,
      ): c is Required<
        Pick<NonNullable<(typeof data)['outline']>[number], 'latitude' | 'longitude'>
      > => !!c.latitude && !!c.longitude,
    );
    if (validatedOutline?.length) {
      const center = GetCenterFromDegrees(validatedOutline.map((c) => [c.latitude, c.longitude]));
      if (center) {
        return [+center[0], +center[1]];
      }
    }
    if (data.parking && data.parking.latitude && data.parking.longitude) {
      return [+data.parking.latitude, +data.parking.longitude];
    }
    return [0, 0];
  })();

  return (
    <>
      <title>{`${data.name} (${data.areaName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment}></meta>
      <div style={{ marginBottom: '5px' }}>
        <div style={{ float: 'right' }}>
          {data && meta.isAdmin && (
            <Button.Group size='mini' compact>
              <Button animated='fade' as={Link} to={`/problem/edit/${data.id}/0`}>
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name='plus' />
                </Button.Content>
              </Button>
              <Button animated='fade' as={Link} to={`/sector/edit/${data.areaId}/${data.id}`}>
                <Button.Content hidden>Edit</Button.Content>
                <Button.Content visible>
                  <Icon name='edit' />
                </Button.Content>
              </Button>
            </Button.Group>
          )}
        </div>
        <Breadcrumb>
          <Breadcrumb.Section>
            <Link to='/areas'>Areas</Link>
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section>
            <Link to={`/area/${data.areaId}`}>{data.areaName}</Link>{' '}
            <LockSymbol
              lockedAdmin={!!data.areaLockedAdmin}
              lockedSuperadmin={!!data.areaLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>
            {data.name}{' '}
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {(data.areaAccessClosed || data.accessClosed) && (
        <Message
          size='huge'
          negative
          icon='attention'
          header={(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed!'}
          content={(data.areaAccessClosed || '') + (data.accessClosed || '')}
        />
      )}
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data.areaAccessInfo || data.accessInfo || data.areaNoDogsAllowed) && (
            <Table.Row warning verticalAlign='top'>
              <Table.Cell>Restrictions:</Table.Cell>
              <Table.Cell>
                {data.areaNoDogsAllowed && <NoDogsAllowed />}
                {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
                {data.accessInfo && <p>{data.accessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign='top'>
            <Table.Cell width={3}>Sector:</Table.Cell>
            <Table.Cell>
              {uniqueTypes.map((subType) => {
                const header = subType ? subType : 'Boulders';
                const problemsOfType =
                  data.problems?.filter(
                    (p) =>
                      (subType === 'Projects' && p.gradeNumber === 0) ||
                      (subType === 'Broken' && p.broken) ||
                      (p.t?.subType === subType && p.gradeNumber !== 0),
                  ) ?? [];
                const numTicked = problemsOfType.filter((p) => p.ticked).length;
                const txt =
                  numTicked === 0
                    ? problemsOfType.length
                    : problemsOfType.length + ' (' + numTicked + ' ticked)';
                return (
                  <Label key={[header, txt].join('/')} basic>
                    {header}:<Label.Detail>{txt}</Label.Detail>
                  </Label>
                );
              })}
              <Label basic>
                Page views:
                <Label.Detail>{data.pageViews}</Label.Detail>
              </Label>
              <br />
              <Markdown content={data.comment} />
            </Table.Cell>
          </Table.Row>
          {((data.sectors ?? []).length > 1 || data.areaComment) && (
            <Table.Row verticalAlign='top'>
              <Table.Cell width={3}>Area:</Table.Cell>
              <Table.Cell>
                {(data.sectors ?? []).length > 1 && (
                  <Label.Group size='tiny'>
                    {(data.sectors ?? []).map((s) => (
                      <Label key={s.id} as={Link} to={`/sector/${s.id}`} active={data.id === s.id}>
                        <LockSymbol
                          lockedAdmin={!!s.lockedAdmin}
                          lockedSuperadmin={!!s.lockedSuperadmin}
                        />
                        {s.name}
                      </Label>
                    ))}
                  </Label.Group>
                )}
                <ExpandableText text={data.areaComment} maxLength={75} />
              </Table.Cell>
            </Table.Row>
          )}
          {(data.approach?.coordinates ?? []).length > 0 && (
            <Table.Row verticalAlign='top'>
              <Table.Cell>Approach:</Table.Cell>
              <Table.Cell>
                <SlopeProfile
                  areaName={data.areaName}
                  sectorName={data.name}
                  slope={data.approach as Slope}
                />
              </Table.Cell>
            </Table.Row>
          )}
          {(data.descent?.coordinates ?? []).length > 0 && (
            <Table.Row verticalAlign='top'>
              <Table.Cell>Descent:</Table.Cell>
              <Table.Cell>
                <SlopeProfile
                  areaName={data.areaName}
                  sectorName={data.name}
                  slope={data.descent as Slope}
                />
              </Table.Cell>
            </Table.Row>
          )}
          {(data.triviaMedia ?? []).length > 0 && (
            <Table.Row verticalAlign='top'>
              <Table.Cell>Trivia:</Table.Cell>
              <Table.Cell>
                <Feed.Extra>
                  <Media
                    pitches={null}
                    media={data.triviaMedia}
                    orderableMedia={orderableMedia}
                    carouselMedia={carouselMedia}
                    optProblemId={null}
                    showLocation={false}
                  />
                </Feed.Extra>
              </Table.Cell>
            </Table.Row>
          )}
          {conditionLat > 0 &&
            conditionLng > 0 &&
            (data.wallDirectionCalculated || data.wallDirectionManual) && (
              <Table.Row verticalAlign='top'>
                <Table.Cell>Conditions:</Table.Cell>
                <Table.Cell>
                  <ConditionLabels
                    lat={conditionLat}
                    lng={conditionLng}
                    label={data.name ?? ''}
                    wallDirectionCalculated={data.wallDirectionCalculated}
                    wallDirectionManual={data.wallDirectionManual}
                    sunFromHour={data.sunFromHour ?? data.areaSunFromHour ?? 0}
                    sunToHour={data.sunToHour ?? data.areaSunToHour ?? 0}
                  />
                </Table.Cell>
              </Table.Row>
            )}
          <Table.Row verticalAlign='top'>
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <DownloadButton href={`/sectors/pdf?id=${data.id}`}>sector.pdf</DownloadButton>
              <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
              {data.parking && (
                <Label
                  href={`https://www.google.com/maps/search/?api=1&query=${data.parking.latitude},${data.parking.longitude}`}
                  rel='noreferrer noopener'
                  target='_blank'
                  image
                  basic
                >
                  <Icon name='map' />
                  Parking
                </Label>
              )}
              {meta.isClimbing && (data.outline ?? []).length > 0 && (
                <Label
                  href={`https://www.google.com/maps/search/?api=1&query=${(data.outline ?? [])[0]?.latitude},${(data.outline ?? [])[0]?.longitude}`}
                  rel='noreferrer noopener'
                  target='_blank'
                  image
                  basic
                >
                  <Icon name='map' />
                  Sector
                </Label>
              )}
              <ExternalLinkLabels externalLinks={data.externalLinks} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <ProblemList
        storageKey={`sector/${sectorId}`}
        mode='sector'
        defaultOrder={data.orderByGrade ? 'grade-desc' : 'number'}
        rows={
          data.problems?.map((p) => {
            return {
              element: <SectorListItem key={p.id} problem={p} />,
              name: p.name ?? '',
              nr: p.nr ?? 0,
              gradeNumber: p.gradeNumber ?? 0,
              stars: p.stars ?? 0,
              numTicks: p.numTicks ?? 0,
              ticked: p.ticked ?? false,
              rock: p.rock ?? '',
              subType: p.t?.subType ?? '',
              num: 0,
              fa: false,
              faDate: p.faDate ?? null,
              areaName: '',
              sectorName: '',
            } satisfies ComponentProps<typeof ProblemList>['rows'][number];
          }) ?? []
        }
      />
    </>
  );
};

export default Sector;
