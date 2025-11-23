import React from 'react';
import { Segment, Pagination, Feed, Placeholder } from 'semantic-ui-react';
import { LockSymbol } from './common/widgets/widgets';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMeta } from './common/meta';
import { useTicks } from '../api';
import { HeaderButtons } from './common/HeaderButtons';

const PlaceholderFeed = () => {
  return (
    <Placeholder>
      {new Array(20).fill(0).map((_, i) => (
        <Placeholder.Header key={i}>
          <Placeholder.Line length='full' />
        </Placeholder.Header>
      ))}
    </Placeholder>
  );
};

const Ticks = () => {
  const { page } = useParams();
  const meta = useMeta();
  const { data, isLoading } = useTicks(+page);
  const navigate = useNavigate();

  return (
    <>
      <title>{`Ticks | ${meta?.title}`}</title>
      <Segment>
        <HeaderButtons header='Public ascents' icon='checkmark' />
        <Feed>
          {isLoading && <PlaceholderFeed />}
          {data &&
            data.ticks.map((t) => (
              <Feed.Event
                key={[t.date, t.name].join(' - ')}
                as={Link}
                to={`/problem/${t.problemId}`}
              >
                <Feed.Content>
                  <Feed.Summary>
                    <Feed.Date>{t.date}</Feed.Date> {t.areaName}{' '}
                    <LockSymbol
                      lockedAdmin={t.areaLockedAdmin}
                      lockedSuperadmin={t.areaLockedSuperadmin}
                    />{' '}
                    / {t.sectorName}{' '}
                    <LockSymbol
                      lockedAdmin={t.sectorLockedAdmin}
                      lockedSuperadmin={t.sectorLockedSuperadmin}
                    />{' '}
                    / {t.problemName}{' '}
                    <LockSymbol
                      lockedAdmin={t.problemLockedAdmin}
                      lockedSuperadmin={t.problemLockedSuperadmin}
                    />
                    <Feed.Meta>
                      {t.name} {t.problemGrade}
                    </Feed.Meta>
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            ))}
        </Feed>
        {data && (
          <Pagination
            size='tiny'
            siblingRange={0}
            boundaryRange={0}
            defaultActivePage={data.currPage}
            totalPages={data.numPages}
            onPageChange={(e, data) => {
              const page = data.activePage;
              navigate('/ticks/' + page);
            }}
          />
        )}
      </Segment>
    </>
  );
};

export default Ticks;
