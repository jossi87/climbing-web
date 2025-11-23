import React from 'react';
import { Segment, List, Grid, Container, Divider, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const styleGitHubBrv = {
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
  paddingLeft: '10px',
  paddingRight: '10px',
  maxWidth: '170px',
  backgroundColor: '#FFFFFF',
};
const styleFacebook = {
  width: '175px',
  marginLeft: '5px',
  marginBottom: '5px',
};
const currYear = new Date().getFullYear();

function Footer() {
  return (
    <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
      <Container textAlign='center'>
        <Grid columns={3} stackable>
          <Grid.Row>
            <Grid.Column>
              <a
                href={'https://github.com/jossi87/climbing-web'}
                rel='noreferrer noopener'
                target='_blank'
              >
                <img style={styleGitHubBrv} src={'/png/GitHub_Logo.png'} alt='GitHub' />
              </a>
            </Grid.Column>
            <Grid.Column>
              <a href={'https://brv.no'} rel='noreferrer noopener' target='_blank'>
                <img style={styleGitHubBrv} src={'/png/brv.png'} alt='Bratte Rogalands venner' />
              </a>
            </Grid.Column>
            <Grid.Column>
              <a
                href={'https://www.facebook.com/groups/brattelinjer'}
                rel='noreferrer noopener'
                target='_blank'
              >
                <Button style={styleFacebook} color='facebook'>
                  <Icon name='facebook' /> Facebook
                </Button>
              </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider inverted section />
        <List horizontal inverted divided link>
          <List.Item as={Link} to='/about'>
            About
          </List.Item>
          <List.Item
            as='a'
            href={`mailto:jostein.oygarden@gmail.com?subject=${window.location.href}`}
          >
            Contact
          </List.Item>
          <List.Item as='a' href='/gpl-3.0.txt' rel='noreferrer noopener' target='_blank'>
            GNU Public License
          </List.Item>
          <List.Item as={Link} to='/privacy-policy'>
            Privacy Policy
          </List.Item>
        </List>
        <p>Buldreinfo &amp; Bratte Linjer - 2003-{currYear}</p>
      </Container>
    </Segment>
  );
}

export default Footer;
