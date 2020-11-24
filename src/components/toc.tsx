import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Header, List, Segment, Icon, Button, ButtonGroup } from 'semantic-ui-react';
import { LoadingAndRestoreScroll, LockSymbol, Stars } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getToc, getTocXlsx } from '../api';
import { saveAs } from 'file-saver';

const Toc = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!loading) {
      getToc(accessToken).then((data) => setData(data));
    }
  }, [loading, accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  let isBouldering = data.metadata.isBouldering;
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
        <ButtonGroup floated="right" size="mini">
          <Button loading={isSaving} icon labelPosition="left" onClick={() => {
            setIsSaving(true);
            let filename = "toc.xlsx";
            getTocXlsx(accessToken).then(response => {
              filename = response.headers.get("content-disposition").slice(22,-1);
              return response.blob();
            })
            .then (blob => {
              setIsSaving(false);
              saveAs(blob, filename);
            });
          }}>
            <Icon name="file excel"/>
            Download
          </Button>
        </ButtonGroup>
        <Header as="h2">Table of Contents</Header>
        <List celled>
          {data.areas.map((area, i) => (
            <List.Item key={i}>
              <List.Header><Link to={{pathname: area.url}} target='_blank'>{area.name}</Link><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /></List.Header>
              {area.sectors.map((sector, i) => (
                <List.List key={i}>
                  <List.Header><Link to={{pathname: sector.url}} target='_blank'>{sector.name}</Link><LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} /></List.Header>
                  <List.List>
                  {sector.problems.map((problem, i) => {
                    var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
                    var typeAscents;
                    if (isBouldering) {
                      if (ascents) {
                        typeAscents = " (" + ascents + ") ";
                      }
                      else {
                        typeAscents = " ";
                      }
                    } else if (!isBouldering) {
                      let t = problem.t.subType;
                      if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
                      if (ascents) {
                        typeAscents = " (" + t + ", " + ascents + ") ";
                      } else {
                        typeAscents = " (" + t + ") ";
                      }
                    }
                    return (
                      <List.Item key={i}>
                        <List.Header>
                          {`#${problem.nr} `}
                          <Link to={{pathname: problem.url}} target='_blank'>{problem.name}</Link>
                          {' '}{problem.grade}
                          {' '}<Stars numStars={problem.stars}/>
                          {problem.fa && <small>{problem.fa}</small>}
                          {typeAscents && <small>{typeAscents}</small>}
                          <small><i style={{color: "gray"}}>{problem.description}</i></small>
                          <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                          {problem.ticked && <Icon color="green" name="check"/>}
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

export default Toc;
