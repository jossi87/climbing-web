import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { HashLink } from 'react-router-hash-link';
import { Header, List, Segment, Icon, Button, ButtonGroup } from 'semantic-ui-react';
import { Loading, LockSymbol, Stars } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getToc, getTocXlsx } from '../api';
import { saveAs } from 'file-saver';

const Toc = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!loading) {
      getToc(accessToken)
      .then((data) => setData(data))
      .then(() => {
        const { hash } = window.location;
        if (hash) {
          const id = hash.replace("#", "");
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ block: 'start' })
          }
        }
      });
    }
  }, [loading, accessToken]);

  if (!data) {
    return <Loading />;
  }
  const showType = data.metadata.gradeSystem==='CLIMBING';
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
        <Header as="h2">
          <Icon name='database' />
          <Header.Content>
            Table of Contents
            <Header.Subheader>{data.metadata.description}</Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data.areas.map((area, i) => (
            <React.Fragment key={i}><List.Item key={i} as={HashLink} to={`#${area.id}`}>{area.name}</List.Item><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /></React.Fragment>
          ))}
        </List>
        <List celled>
          {data.areas.map((area, i) => (
            <List.Item key={i}>
              <List.Header><a id={area.id} href={area.url} rel='noreferrer noopener' target='_blank'>{area.name}</a><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /> <HashLink to="#top"><Icon name="arrow alternate circle up outline" color="black"/></HashLink></List.Header>
              {area.sectors.map((sector, i) => (
                <List.List key={i}>
                  <List.Header><a href={sector.url} rel='noreferrer noopener' target='_blank'>{sector.name}</a><LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} /></List.Header>
                  <List.List>
                  {sector.problems.map((problem, i) => {
                    var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
                    var typeAscents;
                    if (showType) {
                      let t = problem.t.subType;
                      if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
                      if (ascents) {
                        typeAscents = " (" + t + ", " + ascents + ") ";
                      } else {
                        typeAscents = " (" + t + ") ";
                      }
                    } else if (!showType) {
                      if (ascents) {
                        typeAscents = " (" + ascents + ") ";
                      }
                      else {
                        typeAscents = " ";
                      }
                    }
                    return (
                      <List.Item key={i}>
                        <List.Header>
                          {`#${problem.nr} `}
                          <a href={problem.url} rel='noreferrer noopener' target='_blank'>{problem.name}</a>
                          {' '}{problem.grade}
                          {' '}<Stars numStars={problem.stars} includeNoRating={false} />
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
