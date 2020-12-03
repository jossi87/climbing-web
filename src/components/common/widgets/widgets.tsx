import React from 'react';
import { Segment, Message, Icon, Popup } from 'semantic-ui-react';

export function LockSymbol({lockedAdmin, lockedSuperadmin}) {
  if (lockedSuperadmin) {
    return <Icon color='black'  name="user secret" />
  } else if (lockedAdmin) {
    return <Icon color='black' name="lock" />
  }
  return null;
}

export function Stars({numStars}) {
  var stars = null;
  if (numStars===0.5) {
    stars = <Icon color='black' name="star half" />;
  } else if (numStars===1.0) {
    stars = <div style={{whiteSpace: 'nowrap', display: 'inline-flex'}}><Icon color='black' name="star" /></div>;
  } else if (numStars===1.5) {
    stars = <div style={{whiteSpace: 'nowrap', display: 'inline-flex'}}><Icon color='black' name="star" /><Icon color='black' name="star half" /></div>;
  } else if (numStars===2.0) {
    stars = <div style={{whiteSpace: 'nowrap', display: 'inline-flex'}}><Icon color='black' name="star" /><Icon color='black' name="star" /></div>;
  } else if (numStars===2.5) {
    stars = <div style={{whiteSpace: 'nowrap', display: 'inline-flex'}}><Icon color='black' name="star" /><Icon color='black' name="star" /><Icon color='black' name="star half" /></div>;
  } else if (numStars===3.0) {
    stars = <div style={{whiteSpace: 'nowrap', display: 'inline-flex'}}><Icon color='black' name="star" /><Icon color='black' name="star" /><Icon color='black' name="star" /></div>;
  }
  if (stars) {
    return (
      <Popup
        trigger={stars}
        header="Guidelines"
        content={
          <div>
            <Icon name="star" /> Nice<br/>
            <Icon name="star" /><Icon name="star" /> Very nice<br/>
            <Icon name="star" /><Icon name="star" /><Icon name="star" /> Fantastic!
          </div>
        }
      />
    );
  }
  return null;
}

export function LoadingAndRestoreScroll() {
  window.scrollTo(0, 0);
  return (
    <Message icon>
      <Icon name='circle notched' loading />
      <Message.Content>
        <Message.Header>Just one second</Message.Header>
        We are fetching that content for you.
      </Message.Content>
    </Message>
  );
}

export function InsufficientPrivileges() {
  return (
    <Segment>
      <h3>Insufficient privileges</h3>
      Contact <a href="mailto:jostein.oygarden@gmail.com">Jostein Øygarden</a> if you want permissions.
    </Segment>
  )
}