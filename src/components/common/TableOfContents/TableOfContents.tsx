import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { List, Icon } from 'semantic-ui-react';
import { LockSymbol, Stars, SunOnWall, WallDirection } from '../../common/widgets/widgets';
import { components } from '../../../@types/buldreinfo/swagger';

const JumpToTop = () => (
  <a onClick={() => window.scrollTo(0, 0)}>
    <Icon name='arrow alternate circle up outline' color='black' />
  </a>
);

export type Props = {
  areas: (Required<
    Pick<
      components['schemas']['Area'],
      'id' | 'lockedAdmin' | 'lockedSuperadmin' | 'name' | 'sunFromHour' | 'sunToHour'
    >
  > & {
    sectors: (Required<
      Pick<
        components['schemas']['Sector'],
        | 'id'
        | 'name'
        | 'lockedAdmin'
        | 'lockedSuperadmin'
        | 'wallDirectionCalculated'
        | 'wallDirectionManual'
        | 'sunFromHour'
        | 'sunToHour'
      >
    > &
      Pick<components['schemas']['TocSector'], 'outline' | 'parking'> & {
        problems: (Required<
          Pick<
            components['schemas']['Problem'],
            'id' | 'name' | 'lockedAdmin' | 'lockedSuperadmin' | 'grade' | 'nr'
          >
        > &
          Pick<
            components['schemas']['Problem'],
            'stars' | 'ticked' | 'todo' | 'coordinates' | 'broken'
          > & {
            text?: string;
            subText?: string;
          })[];
      })[];
  })[];
  header?: React.ReactNode;
  subHeader?: React.ReactNode;
};

export const TableOfContents = ({ areas, header, subHeader }: Props) => {
  const areaRefs = useRef<Record<number, HTMLElement | null>>({});

  if (!areas) {
    return <i>No results match your search criteria.</i>;
  }

  return (
    <>
      {header}
      <List celled link horizontal size='small'>
        {areas.map((area) => (
          <React.Fragment key={area.id}>
            <List.Item
              as='a'
              onClick={() => areaRefs.current[area.id]?.scrollIntoView({ block: 'start' })}
            >
              {area.name}
            </List.Item>
            <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
          </React.Fragment>
        ))}
      </List>
      {subHeader}
      <List celled>
        {areas.map((area) => (
          <List.Item key={area.id}>
            <List.Header>
              <Link
                to={`/area/${area.id}`}
                ref={(ref) => {
                  areaRefs.current[area.id] = ref;
                }}
              >
                {area.name}
              </Link>{' '}
              <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
              <SunOnWall sunFromHour={area.sunFromHour} sunToHour={area.sunToHour} />
              <JumpToTop />
            </List.Header>
            {area.sectors.map((sector) => (
              <List.List key={sector.id}>
                <List.Header>
                  <Link to={`/sector/${sector.id}`}>{sector.name}</Link>{' '}
                  <LockSymbol
                    lockedAdmin={sector.lockedAdmin}
                    lockedSuperadmin={sector.lockedSuperadmin}
                  />
                  <WallDirection
                    wallDirectionCalculated={sector.wallDirectionCalculated}
                    wallDirectionManual={sector.wallDirectionManual}
                  />
                  <SunOnWall sunFromHour={sector.sunFromHour} sunToHour={sector.sunToHour} />
                </List.Header>
                <List.List>
                  {sector.problems.map((problem) => (
                    <List.Item
                      key={problem.id}
                      style={{
                        backgroundColor: problem.ticked
                          ? '#d2f8d2'
                          : problem.todo
                            ? '#d2d2f8'
                            : '#ffffff',
                      }}
                    >
                      <List.Header>
                        {`#${problem.nr} `}
                        <Link to={`/problem/${problem.id}`}>
                          {problem.broken ? <del>{problem.name}</del> : problem.name}
                        </Link>{' '}
                        {problem.grade}{' '}
                        {problem.stars ? (
                          <Stars numStars={problem.stars} includeStarOutlines={false} />
                        ) : null}
                        {problem.text && <small>{problem.text} </small>}
                        {problem.broken && <u>{problem.broken} </u>}
                        {problem.subText && (
                          <small>
                            <i style={{ color: 'gray' }}>{problem.subText} </i>
                          </small>
                        )}
                        <LockSymbol
                          lockedAdmin={problem.lockedAdmin}
                          lockedSuperadmin={problem.lockedSuperadmin}
                        />
                      </List.Header>
                    </List.Item>
                  ))}
                </List.List>
              </List.List>
            ))}
          </List.Item>
        ))}
      </List>
    </>
  );
};
