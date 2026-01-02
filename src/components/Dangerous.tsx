import { Loading } from './common/widgets/widgets';
import { Segment, Icon, Header } from 'semantic-ui-react';
import { useMeta } from './common/meta/context';
import { useData } from '../api';
import TableOfContents from './common/TableOfContents';
import { Success } from '../@types/buldreinfo';
import { components } from '../@types/buldreinfo/swagger';

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getDangerous'>>(`/dangerous`);

  if (!data) {
    return <Loading />;
  }
  const safeData = data ?? [];
  const numAreas = safeData.length;
  const [numSectors, numProblems] = safeData.reduce(
    ([sectors, problems], area) => [
      sectors + (area.sectors?.length ?? 0),
      problems +
        (area.sectors ?? []).reduce((acc, sector) => acc + (sector.problems?.length ?? 0), 0),
    ],
    [0, 0],
  );
  const description = `${numProblems} ${
    meta.isClimbing ? 'routes' : 'boulders'
  } flagged as dangerous (located in ${numAreas} areas, ${numSectors} sectors)`;
  const areas = safeData.map((area) => ({
    id: area.id ?? 0,
    lockedAdmin: !!area.lockedAdmin,
    lockedSuperadmin: !!area.lockedSuperadmin,
    sunFromHour: area.sunFromHour ?? 0,
    sunToHour: area.sunToHour ?? 0,
    name: area.name ?? '',
    sectors: (area.sectors ?? []).map((sector) => ({
      id: sector.id ?? 0,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      polygonCoords: '',
      wallDirectionCalculated:
        sector.wallDirectionCalculated ?? ({} as components['schemas']['CompassDirection']),
      wallDirectionManual:
        sector.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
      name: sector.name ?? '',
      sunFromHour: sector.sunFromHour ?? 0,
      sunToHour: sector.sunToHour ?? 0,
      problems: (sector.problems ?? []).map((problem) => ({
        id: problem.id ?? 0,
        broken: problem.broken,
        lockedAdmin: !!problem.lockedAdmin,
        lockedSuperadmin: !!problem.lockedSuperadmin,
        name: problem.name ?? '',
        nr: problem.nr ?? 0,
        grade: problem.grade ?? '',
        text: problem.postTxt,
        subText: '(' + problem.postWhen + ' - ' + problem.postBy + ')',
      })),
    })),
  }));

  return (
    <>
      <title>{`Dangerous | ${meta?.title}`}</title>
      <meta name='description' content={description}></meta>
      <Segment>
        <Header as='h2'>
          <Icon name='warning sign' />
          <Header.Content>
            Dangerous
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <TableOfContents areas={areas} />
      </Segment>
    </>
  );
};

export default Dangerous;
