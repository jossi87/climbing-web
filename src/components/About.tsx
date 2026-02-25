import { Link } from 'react-router-dom';
import { Grid, Segment, Header, Icon, List, Label, Placeholder } from 'semantic-ui-react';
import { useMeta } from './common/meta/context';
import { useData } from '../api';
import Avatar from './common/avatar/avatar';
import type { Success } from '../@types/buldreinfo';

const About = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getAdministrators'>>(`/administrators`);
  const administrators = (
    <Grid.Column>
      <Segment>
        <Header as='h3'>
          <Icon name='users' />
          <Header.Content>
            Administrators
            {data && <Header.Subheader>{data.length} users</Header.Subheader>}
          </Header.Content>
        </Header>
        <List>
          {data ? (
            data.map((u) => (
              <List.Item key={u.userId}>
                <Avatar name={u.name} mediaId={u.mediaId} mediaVersionStamp={u.mediaVersionStamp} />
                <List.Content>
                  <List.Header as={Link} to={`/user/${u.userId}`}>
                    {u.name}
                  </List.Header>
                  <List.Description>Last seen {u.lastLogin}</List.Description>
                  {u.emails?.map((email) => (
                    <Label key={email} size='tiny' as='a' href={`mailto:${email}`}>
                      <Icon name='mail outline'></Icon>
                      {email}
                    </Label>
                  ))}
                </List.Content>
              </List.Item>
            ))
          ) : (
            <Placeholder>
              {[...Array(10)].map((_, i) => (
                <Placeholder.Header image key={i}>
                  <Placeholder.Line length='medium' />
                  <Placeholder.Line length='short' />
                </Placeholder.Header>
              ))}
            </Placeholder>
          )}
        </List>
      </Segment>
    </Grid.Column>
  );

  return (
    <>
      <title>{`About | ${meta?.title}`}</title>
      <meta name='description' content='History, information and administrators.'></meta>
      <Grid columns={2} stackable>
        <Grid.Column>
          <Segment>
            <Header as='h3'>
              <Icon name='info' />
              <Header.Content>
                Statutes
                <Header.Subheader>
                  This is a nonprofit website created by climbers, for climbers.
                </Header.Subheader>
              </Header.Content>
            </Header>
            <List bulleted>
              <List.Item>
                The webpage is created and maintained by{' '}
                <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a>.
              </List.Item>
              <List.Item>
                The aim and purpose of the websites is to create a good solution that provides as
                good information as possible about the climbing in the region where the solution is
                used, also called a climbing guide.
              </List.Item>
              <List.Item>The site is non-profit and free to use for everyone.</List.Item>
              <List.Item>
                The editors are a variety of active climbers in the different regions.
              </List.Item>
              <List.Item>
                The owner of the content is linked to the origin, whether it is a club or
                individuals.
              </List.Item>
              <List.Item>
                The editors themselves can choose how to cover the costs associated with running the
                websites, with the aim of ensuring free use for the users.
              </List.Item>
            </List>
          </Segment>
          <Segment>
            <Header as='h3'>
              <Icon name='users' />
              <Header.Content>
                Collaboration
                <Header.Subheader>
                  Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein</a> if you or your
                  organization wants to establish your own online guidebook.
                </Header.Subheader>
              </Header.Content>
            </Header>
            Design, upgrade and maintenance of the online guide is done on a voluntary basis. The
            service is non-profit and a collective work of the community in the region.
            <br />
            The yearly cost for a page (as of 2023) is 409,- NOK per page and covers the fee of
            hosting on the server. One page is defined as one topo/guide. E.g. Bouldering, Sport and
            Ice Climbing would be three different pages and thus cost 1227,-. The cost is billed
            annually.
          </Segment>
          <Segment>
            <Header as='h3'>
              <Icon name='pencil' />
              <Header.Content>
                Ethics
                <Header.Subheader>
                  If you&#39;re going out climbing, we ask you to please follow these guidelines for
                  the best possible bouldering experience now, and for the future generations of
                  climbers.
                </Header.Subheader>
              </Header.Content>
            </Header>
            <List bulleted>
              <List.Item>Show respect for the landowners, issue care and be polite.</List.Item>
              <List.Item>Follow paths where possible, and do not cross cultivated land.</List.Item>
              <List.Item>Take your trash back with you.</List.Item>
              <List.Item>
                Park with reason, and think of others. Make room for potential tractors and such if
                necessary.
              </List.Item>
              <List.Item>No chipping allowed.</List.Item>
              <List.Item>
                Remember climbing can be dangerous and always involves risk. Your safety is your own
                responsibility.
              </List.Item>
              {meta.isBouldering ? (
                <>
                  <List.Item>
                    Start where directed, and don&#39;t hesitate to ask if your unsure.
                  </List.Item>
                  <List.Item>
                    Sit start means that the behind should be the last thing to leave the
                    ground/crashpad.
                  </List.Item>
                </>
              ) : (
                <>
                  <List.Item>
                    Loose hangers are expected to be tightened by the climbers themselves, it is
                    recommended to have a spanner (17mm) in the bag at all times.
                  </List.Item>
                  <List.Item>
                    Quickdraws on a route usually means someone is projecting this route, leave them
                    hanging.
                  </List.Item>
                  <List.Item>
                    If there is a piece of rope or similar hanging from the first bolt, it means
                    that the route has been closed by the developer and should not be climbed.
                  </List.Item>
                </>
              )}
            </List>
          </Segment>
          <Segment>
            <Header as='h3'>
              <Icon name='book' />
              <Header.Content>
                History
                <Header.Subheader>
                  The first version of this webpage was published in 2003.
                </Header.Subheader>
              </Header.Content>
            </Header>
            <List bulleted>
              <List.Item>
                2023:{' '}
                <a
                  href='https://github.com/jossi87/climbing-web'
                  rel='noreferrer noopener'
                  target='_blank'
                >
                  https://github.com/jossi87/climbing-web
                </a>
                {' (frontend) '}
                <a
                  href='https://github.com/jossi87/climbing-ws'
                  rel='noreferrer noopener'
                  target='_blank'
                >
                  https://github.com/jossi87/climbing-ws
                </a>
                {' (backend)'}
                <List.Description>The project is now open source.</List.Description>
              </List.Item>
              <List.Item>
                2021:{' '}
                <a href='https://is.brattelinjer.no' rel='noreferrer noopener' target='_blank'>
                  is.brattelinjer.no
                </a>
                <List.Description>
                  Ice climbing guide, by Jostein Øygarden
                  <br />
                  <Label size='mini' basic>
                    <Icon name='camera' />
                    <a
                      href='/png/archive/20211012_is_brattelinjer.png'
                      rel='noreferrer noopener'
                      target='_blank'
                    >
                      Screenshot (2021.10.12)
                    </a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2018:{' '}
                <a href='https://brattelinjer.no' rel='noreferrer noopener' target='_blank'>
                  brattelinjer.no
                </a>
                <List.Description>
                  Sport- and traditional climbing guide, by Jostein Øygarden
                  <br />
                  <Label size='mini' basic>
                    <Icon name='camera' />
                    <a
                      href='/png/archive/20211012_brattelinjer.png'
                      rel='noreferrer noopener'
                      target='_blank'
                    >
                      Screenshot (2021.10.12)
                    </a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2016:{' '}
                <a href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>
                  buldreinfo.com
                </a>
                <List.Description>
                  Bouldering guide, by Jostein Øygarden
                  <br />
                  <Label size='mini' basic>
                    <Icon name='camera' />
                    <a
                      href='/png/archive/20211012_buldreinfo.png'
                      rel='noreferrer noopener'
                      target='_blank'
                    >
                      Screenshot (2021.10.12)
                    </a>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2012-2016:{' '}
                <a href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>
                  buldreinfo.com
                </a>
                <List.Description>
                  Bouldering guide, by Idar Ose
                  <br />
                  <Label size='mini' basic>
                    <Icon name='camera' />
                    <a
                      href='/png/archive/20160205_buldreinfo.png'
                      rel='noreferrer noopener'
                      target='_blank'
                    >
                      Screenshot (2016.02.05)
                    </a>
                    <Label.Detail>
                      <a
                        href='https://web.archive.org/web/20160205060357/http://www.buldreinfo.com/'
                        target='_blank'
                        rel='noreferrer'
                      >
                        source: archive.net
                      </a>
                    </Label.Detail>
                  </Label>
                </List.Description>
              </List.Item>
              <List.Item>
                2006-2012:{' '}
                <a href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>
                  buldreinfo.com
                </a>
                <List.Description>
                  Bouldering guide, by Vegard Aksnes
                  <br />
                  <Label.Group size='mini'>
                    <Label size='mini' basic>
                      <Icon name='camera' />
                      <a
                        href='/png/archive/20110923_buldreinfo.png'
                        rel='noreferrer noopener'
                        target='_blank'
                      >
                        Screenshot (2011.09.23)
                      </a>
                      <Label.Detail>
                        <a
                          href='https://web.archive.org/web/20110923004804/http://www.buldreinfo.com/'
                          target='_blank'
                          rel='noreferrer'
                        >
                          source: archive.net
                        </a>
                      </Label.Detail>
                    </Label>
                    <Label size='mini' basic>
                      <Icon name='camera' />
                      <a
                        href='/png/archive/20071104_buldreinfo.png'
                        rel='noreferrer noopener'
                        target='_blank'
                      >
                        Screenshot (2007.11.04)
                      </a>
                      <Label.Detail>
                        <a
                          href='https://web.archive.org/web/20071104020049/http://www.buldreinfo.com/'
                          target='_blank'
                          rel='noreferrer'
                        >
                          source: archive.net
                        </a>
                      </Label.Detail>
                    </Label>
                  </Label.Group>
                </List.Description>
              </List.Item>
              <List.Item>
                2003-2006: Predecessor to{' '}
                <a href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>
                  buldreinfo.com
                </a>{' '}
                (a page located on the{' '}
                <a href='https://brv.no' rel='noreferrer noopener' target='_blank'>
                  brv.no
                </a>
                -site)
                <List.Description>
                  Bouldering guide, by Vegard Aksnes
                  <br />
                  <Label size='mini' basic>
                    <Icon name='camera' />
                    <a
                      href='/png/archive/20040812_brv_bouldering_guide.png'
                      rel='noreferrer noopener'
                      target='_blank'
                    >
                      Screenshot (2004.08.12)
                    </a>
                    <Label.Detail>
                      <a
                        href='https://web.archive.org/web/20050308114436/http://www.brv.no/gammelt/buldring/oversikt.htm'
                        target='_blank'
                        rel='noreferrer'
                      >
                        source: archive.net
                      </a>
                    </Label.Detail>
                  </Label>
                </List.Description>
              </List.Item>
            </List>
          </Segment>
        </Grid.Column>
        {administrators}
      </Grid>
    </>
  );
};

export default About;
