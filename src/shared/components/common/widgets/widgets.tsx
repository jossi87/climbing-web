import React from 'react';
import { Loader, Button, Icon, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export function LockSymbol({visibility}) {
  if (visibility===1) {
    return <Icon name="lock" />
  } else if (visibility===2) {
    return <Icon name="user secret" />
  }
  return null;
}

export function Stars({numStars}) {
  var stars = null;
  if (numStars===0.5) {
    stars = <Icon name="star half" />;
  } else if (numStars===1.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><Icon name="star" /></div>;
  } else if (numStars===1.5) {
    stars = <div style={{whiteSpace: 'nowrap'}}><Icon name="star" /><Icon name="star half" /></div>;
  } else if (numStars===2.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><Icon name="star" /><Icon name="star" /></div>;
  } else if (numStars===2.5) {
    stars = <div style={{whiteSpace: 'nowrap'}}><Icon name="star" /><Icon name="star" /><Icon name="star half" /></div>;
  } else if (numStars===3.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><Icon name="star" /><Icon name="star" /><Icon name="star" /></div>;
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

export function CroppedText({text, maxLength}) {
  if (text) {
    if (text.length>maxLength) {
      return <Popup trigger={<p>{text.substring(0,maxLength)}...</p>} content={text} />
    } else {
      return text;
    }
  }
  return null;
}

export function TypeImage({t}) {
  var typeImg;
  const subtype = t.subtype;
  switch (t.id) {
    case 2: typeImg = <img height="20" src="/jpg/bolt.jpg" alt={subtype}/>; break;
    case 3: typeImg = <img height="20" src="/jpg/trad.jpg" alt={subtype}/>; break;
    case 4: typeImg = <img height="20" src="/jpg/mixed.jpg" alt={subtype}/>; break;
    case 5: typeImg = <img height="20" src="/jpg/toprope.jpg" alt={subtype}/>; break;
  }
  return <Popup trigger={typeImg} content={t.type + " - " + t.subType} />
}

export function FaButtons({fa}) {
  if (fa) {
    const faButtons = fa.map((u, i) => (<Popup key={i} trigger={<Button size="mini" as={Link} to={`/user/${u.id}`}>{u.initials}</Button>} content={u.firstname + " " + u.surname} />));
    return <Button.Group size="mini">{faButtons}</Button.Group>;
  }
  return null;
}

export function LoadingAndRestoreScroll() {
  if (window) {
    window.scrollTo(0, 0);
  }
  return <Loader active inline='centered' />;
}