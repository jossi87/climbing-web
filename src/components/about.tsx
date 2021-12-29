import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Grid, Segment, Header, Icon, List, Card, Image, Label } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { getAbout } from '../api';

const About = () => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    getAbout(accessToken).then((data) => setData(data));
  }, [accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }

  return (
    <>
      <MetaTags>
        {data.metadata.canonical && <link rel="canonical" href={data.metadata.canonical} />}
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
      <Grid columns={2} stackable>
        <Grid.Column>
          <Segment>
            <Header as="h3">
              <Icon name='info' />
              <Header.Content>
                About
                <Header.Subheader>This is a nonprofit website created by climbers, for climbers.</Header.Subheader>
              </Header.Content>
            </Header>
            The webpage is created and maintained by <a href="mailto:jostein.oygarden@gmail.com">Jostein Øygarden</a>.<br/>
            All data is owned by the local climbing communities. Contact <a href="mailto:jostein.oygarden@gmail.com">Jostein</a> if you want a site for your climbing area.<br/>
            <br/>
            <b>History:</b>
            <List bulleted>
              <List.Item>
                2021-now: <a href="https://is.brattelinjer.no" rel='noreferrer noopener' target='_blank'>is.brattelinjer.no</a>
                <List.Description>
                  Ice climbing guide, by Jostein Øygarden<br/>
                  <Label size="mini" basic>
                    <Icon name="camera" />
                    <a href="/png/archive/20211012_is_brattelinjer.png" rel="noreferrer noopener" target="_blank">Screenshot (2021.10.12)</a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2018-now: <a href="https://brattelinjer.no" rel='noreferrer noopener' target='_blank'>brattelinjer.no</a>
                <List.Description>
                  Sport- and traditional climbing guide, by Jostein Øygarden<br/>
                  <Label size="mini" basic>
                    <Icon name="camera" />
                    <a href="/png/archive/20211012_brattelinjer.png" rel="noreferrer noopener" target="_blank">Screenshot (2021.10.12)</a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2016-now: <a href="https://buldreinfo.com" rel='noreferrer noopener' target='_blank'>buldreinfo.com</a>
                <List.Description>
                  Bouldering guide, by Jostein Øygarden<br/>
                  <Label size="mini" basic>
                    <Icon name="camera" />
                    <a href="/png/archive/20211012_buldreinfo.png" rel="noreferrer noopener" target="_blank">Screenshot (2021.10.12)</a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2012-2016: <a href="https://buldreinfo.com" rel='noreferrer noopener' target='_blank'>buldreinfo.com</a>
                <List.Description>
                  Bouldering guide, by Idar Ose<br/>
                  <Label size="mini" basic>
                    <Icon name="camera" />
                    <a href="/png/archive/20160205_buldreinfo.png" rel="noreferrer noopener" target="_blank">Screenshot (2016.02.05)</a>
                    <Label.Detail as={Link} to="https://web.archive.org/web/20160205060357/http://www.buldreinfo.com/" target="_blank">source: archive.net</Label.Detail>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2006-2012: <a href="https://buldreinfo.com" rel='noreferrer noopener' target='_blank'>buldreinfo.com</a>
                <List.Description>
                  Bouldering guide, by Vegard Aksnes<br/>
                  <Label.Group size="mini">
                    <Label size="mini" basic>
                      <Icon name="camera" />
                      <a href="/png/archive/20110923_buldreinfo.png" rel="noreferrer noopener" target="_blank">Screenshot (2011.09.23)</a>
                      <Label.Detail as={Link} to="https://web.archive.org/web/20110923004804/http://www.buldreinfo.com/" target="_blank">source: archive.net</Label.Detail>
                    </Label>
                    <Label size="mini" basic>
                      <Icon name="camera" />
                      <a href="/png/archive/20071104_buldreinfo.png" rel="noreferrer noopener" target="_blank">Screenshot (2007.11.04)</a>
                      <Label.Detail as={Link} to="https://web.archive.org/web/20071104020049/http://www.buldreinfo.com/" target="_blank">source: archive.net</Label.Detail>
                    </Label>
                  </Label.Group>
                </List.Description>
              </List.Item>
              <List.Item>
                2003-2006: Predecessor to <a href="https://buldreinfo.com" rel='noreferrer noopener' target='_blank'>buldreinfo.com</a> (a page located on the <a href="https://brv.no" rel='noreferrer noopener' target='_blank'>brv.no</a>-site)
                <List.Description>
                  Bouldering guide, by Vegard Aksnes<br/>
                  <Label size="mini" basic>
                    <Icon name="camera" />
                    <a href="/png/archive/20040812_brv_bouldering_guide.png" rel="noreferrer noopener" target="_blank">Screenshot (2004.08.12)</a>
                    <Label.Detail as={Link} to="https://web.archive.org/web/20050308114436/http://www.brv.no/gammelt/buldring/oversikt.htm" target="_blank">source: archive.net</Label.Detail>
                  </Label>
                </List.Description>
              </List.Item>
            </List>
          </Segment>
          <Segment>
            <Header as="h3">
              <Icon name='pencil' />
              <Header.Content>
                Ethics
                <Header.Subheader>If you&#39;re going out climbing, we ask you to please follow these guidelines for the best possible bouldering experience now, and for the future generations of climbers.</Header.Subheader>
              </Header.Content>
            </Header>
            <List bulleted>
              <List.Item>Show respect for the landowners, issue care and be polite.</List.Item>
              <List.Item>Follow paths where possible, and do not cross cultivated land.</List.Item>
              <List.Item>Take your trash back with you.</List.Item>
              <List.Item>Park with reason, and think of others. Make room for potential tractors and such if necessary.</List.Item>
              <List.Item>Start where directed, and don&#39;t hesitate to ask if your unsure.</List.Item>
              <List.Item>Sit start means that the behind should be the last thing to leave the ground/crashpad.</List.Item>
              <List.Item>No chipping allowed.</List.Item>
              <List.Item>Remember climbing can be dangerous and always involves risk. Your safety is your own responsibility.</List.Item>
              <List.Item>Use common sense!</List.Item>
            </List>
          </Segment>
        </Grid.Column>
        {data.administrators && data.administrators.length>0 &&
          <Grid.Column>
            <Segment>
              <Header as="h3">
                <Icon name='users' />
                <Header.Content>
                  Administrators
                  <Header.Subheader>{data.administrators.length} users</Header.Subheader>
                </Header.Content>
              </Header>
              <List>
                {data.administrators.map((u, key) => (
                  <List.Item key={key}>
                    <Image src={u.picture? u.picture : '/png/image.png'} />
                    <List.Content>
                      <List.Header as={Link} to={`/user/${u.userId}`}>{u.name}</List.Header>
                      <List.Description>Last seen {u.lastLogin}</List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          </Grid.Column>
        }
      </Grid>
    </>
  );
}

export default About;
