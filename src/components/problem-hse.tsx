import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Icon, List, Header } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblemHse } from '../api';

const ProblemHse = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!loading) {
      getProblemHse(accessToken).then((data) => setData(data));
    }
  }, [loading, accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
      <Segment>
        <Header as="h2">
          <Icon name='warning sign' />
          <Header.Content>
            Health and Safety Executive (HSE) 
            <Header.Subheader>{data.metadata.description}</Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data.areas.map((area, i) => (
            <><List.Item key={i} as={HashLink} to={`#${area.id}`}>{area.name}</List.Item><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /></>
          ))}
        </List>
        <List celled>
          {data.areas.map((area, i) => (
            <List.Item key={i}>
              <List.Header><Link id={area.id} to={{pathname: area.url}} target='_blank'>{area.name}</Link><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /> <HashLink to="#top"><Icon name="arrow alternate circle up outline" color="black"/></HashLink></List.Header>
              {area.sectors.map((sector, i) => (
                <List.List key={i}>
                  <List.Header><Link to={{pathname: sector.url}} target='_blank'>{sector.name}</Link><LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} /></List.Header>
                  <List.List>
                  {sector.problems.map((problem, i) => {
                    return (
                      <List.Item key={i}>
                        <List.Header>
                          {`#${problem.nr} `}
                          <Link to={{pathname: problem.url}} target='_blank'>{problem.name}</Link>
                          {' '}{problem.grade}{' '}
                          <small><i style={{color: "gray"}}>{`${problem.postTxt} (${problem.postWhen} - ${problem.postBy})`}</i></small>
                          <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                        </List.Header>
                      </List.Item>
                    )
                  })}
                  </List.List>
                </List.List>
              ))}
            </List.Item>
          ))}
        </List>
      </Segment>
    </>
  );
}

export default ProblemHse;
