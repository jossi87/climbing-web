import { useEffect, useState } from 'react';
import { Segment, Icon, Button, ButtonGroup, Message, Divider } from 'semantic-ui-react';
import { Loading } from '../common/widgets/widgets';
import { useMeta } from '../common/meta/context';
import { downloadTocXlsx, useAccessToken, useToc } from '../../api';
import TableOfContents from '../common/TableOfContents';
import { useFilterState } from './reducer';
import { FilterContext, FilterForm } from '../common/FilterForm';
import { HeaderButtons } from '../common/HeaderButtons';
import type { components } from '../../@types/buldreinfo/swagger';
import './Problems.css';
import { ProblemsMap } from '../common/TableOfContents/ProblemsMap';

type Props = { filterOpen?: boolean };

const description = (
  regions: number,
  areas: number,
  sectors: number,
  problems: number,
  kind: 'routes' | 'problems',
): string => `${regions} regions, ${areas} areas, ${sectors} sectors, ${problems} ${kind}`;

type FilterProblem = {
  id: number;
  broken: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  nr: number;
  grade: string;
  stars?: number;
  ticked?: boolean;
  todo?: boolean;
  text: string;
  subText?: string;
  lat?: number;
  lng?: number;
  faYear: number;
  mAsl: number;
};

type FilterSector = Pick<components['schemas']['TocSector'], 'outline'> & {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  wallDirectionCalculated: components['schemas']['CompassDirection'];
  wallDirectionManual: components['schemas']['CompassDirection'];
  sunFromHour: number;
  sunToHour: number;
  lat?: number;
  lng?: number;
  problems: FilterProblem[];
};

type FilterArea = {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  sunFromHour: number;
  sunToHour: number;
  name: string;
  lat?: number;
  lng?: number;
  sectors: FilterSector[];
};

export const Problems = ({ filterOpen }: Props) => {
  const meta = useMeta();
  const [state, dispatch] = useFilterState({
    visible: !!filterOpen || window.innerWidth > 991,
  });

  const accessToken = useAccessToken();
  const { data: loadedData, status } = useToc();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(!!(matchMedia && matchMedia('(pointer:fine)')?.matches));

  useEffect(() => {
    if (status === 'success') {
      dispatch({ action: 'set-data', data: loadedData });
    }
  }, [dispatch, loadedData, status]);

  const {
    totalRegions,
    totalAreas,
    totalSectors,
    totalProblems,
    filteredData,
    filteredRegions,
    filteredAreas,
    filteredSectors,
    filteredProblems,
    visible,
  } = state;

  if (status === 'pending' || totalProblems === 0) {
    return <Loading />;
  }

  const title = meta.isBouldering ? 'Problems' : 'Routes';
  const things = meta.isBouldering ? 'problems' : 'routes';
  const totalDescription = description(
    totalRegions,
    totalAreas,
    totalSectors,
    totalProblems,
    things,
  );

  const areas: FilterArea[] =
    filteredData?.regions?.flatMap((region) => {
      return (
        region.areas?.map(
          (area) =>
            ({
              id: area.id ?? 0,
              lockedAdmin: !!area.lockedAdmin,
              lockedSuperadmin: !!area.lockedSuperadmin,
              sunFromHour: area.sunFromHour ?? 0,
              sunToHour: area.sunToHour ?? 0,
              name: area.name ?? '',
              lat: area.coordinates?.latitude,
              lng: area.coordinates?.longitude,
              sectors:
                area.sectors?.map(
                  (sector) =>
                    ({
                      id: sector.id ?? 0,
                      lockedAdmin: !!sector.lockedAdmin,
                      lockedSuperadmin: !!sector.lockedSuperadmin,
                      name: sector.name ?? '',
                      lat: sector.parking?.latitude,
                      lng: sector.parking?.longitude,
                      outline: sector.outline,
                      wallDirectionCalculated: sector.wallDirectionCalculated ?? {},
                      wallDirectionManual: sector.wallDirectionManual ?? {},
                      sunFromHour: sector.sunFromHour ?? 0,
                      sunToHour: sector.sunToHour ?? 0,
                      problems:
                        sector.problems?.map((problem) => {
                          const metaParts: string[] = [];
                          if (meta.isClimbing) {
                            if (problem.t?.subType) metaParts.push(problem.t.subType);
                            if ((problem.numPitches ?? 0) > 1)
                              metaParts.push(`${problem.numPitches}p`);
                          }
                          if (problem.numTicks) {
                            metaParts.push(
                              `${problem.numTicks} asc${problem.numTicks === 1 ? '' : 's'}`,
                            );
                          }
                          const sAlt = problem.startingAltitude;
                          const cElev = problem.coordinates?.elevation;
                          const elev =
                            (sAlt ?? 0) > 0
                              ? { v: sAlt as number, p: '' }
                              : typeof cElev === 'number'
                                ? { v: cElev, p: '~' }
                                : null;

                          if (elev) {
                            metaParts.push(`${elev.p}${Math.round(elev.v)}m a.s.l.`);
                          }
                          const metaString = metaParts.length ? `(${metaParts.join(', ')})` : '';
                          const text = [problem.fa, problem.faYear, metaString]
                            .filter(Boolean)
                            .join(' ')
                            .trim();
                          return {
                            id: problem.id ?? 0,
                            broken: problem.broken ?? '',
                            lockedAdmin: !!problem.lockedAdmin,
                            lockedSuperadmin: !!problem.lockedSuperadmin,
                            name: problem.name ?? '',
                            lat: problem.coordinates?.latitude,
                            lng: problem.coordinates?.longitude,
                            nr: problem.nr ?? 0,
                            grade: problem.grade ?? '',
                            stars: problem.stars,
                            ticked: problem.ticked,
                            todo: problem.todo,
                            text: text,
                            subText: problem.description,
                            faYear: problem.faYear ?? 0,
                            mAsl:
                              (problem.startingAltitude ?? 0 > 0)
                                ? (problem.startingAltitude ?? 0)
                                : (cElev ?? 0),
                          } satisfies FilterProblem;
                        }) ?? [],
                    }) satisfies FilterSector,
                ) ?? [],
            }) satisfies FilterArea,
        ) ?? []
      );
    }) ?? [];

  return (
    <FilterContext.Provider value={{ ...state, dispatch }}>
      <title>{`${title} | ${meta?.title}`}</title>
      <meta name='description' content={totalDescription}></meta>
      <Segment>
        <div className='filter-container'>
          <div className='filter-header'>
            <HeaderButtons header={title} subheader={totalDescription} icon='database'>
              <Button
                labelPosition='left'
                icon
                toggle
                active={visible}
                onClick={() => dispatch({ action: 'toggle-filter' })}
                primary={filteredProblems > 0}
              >
                <Icon name='filter' />
                Filter {things}
              </Button>
              <Button
                loading={isSaving}
                icon
                labelPosition='left'
                onClick={() => {
                  setIsSaving(true);
                  downloadTocXlsx(accessToken).finally(() => {
                    setIsSaving(false);
                  });
                }}
              >
                <Icon name='file excel' />
                Download
              </Button>
            </HeaderButtons>
            <Divider />
          </div>
          <div className='filter-form'>
            {visible && (
              <div>
                <FilterForm />
              </div>
            )}
          </div>
          <div className='filter-results'>
            {!visible && filteredProblems > 0 && (
              <Message warning>
                There is an active filter which is hiding{' '}
                <strong>
                  {description(
                    filteredRegions,
                    filteredAreas,
                    filteredSectors,
                    filteredProblems,
                    things,
                  )}
                </strong>
                .
                <br />
                <ButtonGroup size='tiny'>
                  <Button compact onClick={() => dispatch({ action: 'open-filter' })}>
                    <Icon name='edit outline' />
                    Edit filter
                  </Button>
                  <Button.Or />
                  <Button compact onClick={() => dispatch({ action: 'reset', section: 'all' })}>
                    <Icon name='trash alternate outline' />
                    Clear filter
                  </Button>
                </ButtonGroup>
              </Message>
            )}
            <TableOfContents
              header={
                <HeaderButtons>
                  <Button
                    toggle={showMap}
                    active={showMap}
                    icon
                    labelPosition='left'
                    onClick={() => setShowMap((v) => !v)}
                  >
                    <Icon name='map outline' />
                    Map
                  </Button>
                </HeaderButtons>
              }
              subHeader={showMap && <ProblemsMap areas={areas} />}
              areas={areas}
            />
          </div>
        </div>
      </Segment>
    </FilterContext.Provider>
  );
};
