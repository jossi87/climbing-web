import React from 'react'
import {Segment, List, Grid, Header, Container, Divider, Button, Icon} from "semantic-ui-react"
import { Link } from "react-router-dom"

const styleFacebook = {
    width: '170px',
    marginTop: '3px',
    marginLeft: '5px',
    marginBottom: '5px',
  }
  const styleBrv = {
    marginBottom: '10px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    paddingLeft: '10px',
    paddingRight: '10px',
    maxWidth: '170px',
    backgroundColor: '#FFFFFF'
  };
  const styleGoogle = {
    width: '200px',
    marginTop: '-22px',
  }

function Footer() {

  return (
    <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
        <Container textAlign='center'>
          <Grid divided inverted stackable>
            <Grid.Row>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Bouldering' />
                <List link inverted>
                  <List.Item as='a' href='/sites/boulder'>Map</List.Item>
                  <br/>
                  <List.Item as='a' href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://buldre.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                  <List.Item as='a' href='https://buldreforer.tromsoklatring.no' rel='noreferrer noopener' target='_blank'>Troms</List.Item>
                  <List.Item as='a' href='https://buldring.bergen-klatreklubb.no' rel='noreferrer noopener' target='_blank'>Bergen</List.Item>
                  <List.Item as='a' href='https://buldring.flatangeradventure.no' rel='noreferrer noopener' target='_blank'>Trondheim</List.Item>
                  <List.Item as='a' href='https://buldring.jotunheimenfjellsport.com' rel='noreferrer noopener' target='_blank'>Jotunheimen</List.Item>
                  <List.Item as='a' href='https://buldring.narvikklatreklubb.no' rel='noreferrer noopener' target='_blank'>Narvik</List.Item>
                  <List.Item as='a' href='https://hkl.buldreinfo.com' rel='noreferrer noopener' target='_blank'>Haugalandet</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Route climbing' />
                <List link inverted>
                  <List.Item as='a' href='/sites/climbing'>Map</List.Item>
                  <br/>
                  <List.Item as='a' href='https://brattelinjer.no' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://hkl.brattelinjer.no' rel='noreferrer noopener' target='_blank'>Haugalandet</List.Item>
                  <List.Item as='a' href='https://klatreforer.narvikklatreklubb.no' rel='noreferrer noopener' target='_blank'>Narvik</List.Item>
                  <List.Item as='a' href='https://klatreforer.tromsoklatring.no' rel='noreferrer noopener' target='_blank'>Troms</List.Item>
                  <List.Item as='a' href='https://klatring.flatangeradventure.no' rel='noreferrer noopener' target='_blank'>Trondheim</List.Item>
                  <List.Item as='a' href='https://klatring.jotunheimenfjellsport.com' rel='noreferrer noopener' target='_blank'>Jotunheimen</List.Item>
                  <List.Item as='a' href='https://tau.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Ice climbing' />
                <List link inverted>
                  <List.Item as='a' href='/sites/ice'>Map</List.Item>
                  <br/>
                  <List.Item as='a' href='https://is.brattelinjer.no' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://is.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Links' />
                <a href={"https://www.facebook.com/groups/brattelinjer"} rel="noreferrer noopener" target="_blank"><Button style={styleFacebook} color='facebook'><Icon name='facebook' /> Facebook</Button></a><br/>
                <a href={"https://brv.no"} rel="noreferrer noopener" target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a><br/>
                <a href='https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'  rel="noreferrer noopener" target="_blank"><img style={styleGoogle} alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Divider inverted section />
          <List horizontal inverted divided link>
            <List.Item as={Link} to='/about'>About</List.Item>
            <List.Item as='a' href={`mailto:jostein.oygarden@gmail.com?subject=${window.location.href}`}>Contact</List.Item>
            <List.Item as='a' href='/gpl-3.0.txt' rel='noreferrer noopener' target='_blank'>GNU Public License</List.Item>
            <List.Item as={Link} to='/privacy-policy'>Privacy Policy</List.Item>
          </List>
          <p>
            Buldreinfo &amp; Bratte Linjer - 2006-2023
          </p>
        </Container>
      </Segment>
  )
}

export default Footer