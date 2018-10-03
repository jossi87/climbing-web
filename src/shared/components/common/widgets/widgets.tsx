import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonToolbar, ButtonGroup, Button, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';

export function LockSymbol({visibility}) {
  if (visibility===1) {
    return <FontAwesomeIcon icon="lock" />
  } else if (visibility===2) {
    return <FontAwesomeIcon icon="user-secret" />
  }
  return null;
}

export function Stars({numStars}) {
  var stars = null;
  if (numStars===0.5) {
    stars = <FontAwesomeIcon icon="star-half" />;
  } else if (numStars===1.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /></div>;
  } else if (numStars===1.5) {
    stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
  } else if (numStars===2.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
  } else if (numStars===2.5) {
    stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
  } else if (numStars===3.0) {
    stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
  }
  if (stars) {
    return (
      <OverlayTrigger placement="top" overlay={
        <Popover id="Guidelines" title="Guidelines">
          <FontAwesomeIcon icon="star" /> Nice<br/>
          <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice<br/>
          <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!
        </Popover>
      }>{stars}</OverlayTrigger>
    );
  }
  return null;
}

export function CroppedText({text, maxLength, i}) {
  if (text) {
    if (text.length>maxLength) {
      const tooltip = (<Tooltip id={i}>{text}</Tooltip>);
      return <OverlayTrigger key={i} placement="top" overlay={tooltip}><span>{text.substring(0,maxLength) + "..."}</span></OverlayTrigger>;
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
  return (
    <OverlayTrigger placement="top" overlay={<Popover id={t.id} title="Type"> {t.type + " - " + t.subType}</Popover>}>
      {typeImg}
    </OverlayTrigger>
  );
}

export function FaButtons({fa}) {
  if (fa) {
    const faButtons = fa? fa.map((u, i) => {
      const tooltip = (<Tooltip id={i}>{u.firstname} {u.surname}</Tooltip>);
      return (<OverlayTrigger key={i} placement="top" overlay={tooltip}><LinkContainer key={i} to={`/user/${u.id}`}><Button key={i} bsStyle="default">{u.initials}</Button></LinkContainer></OverlayTrigger>)
    }) : [];
    return <ButtonToolbar><ButtonGroup bsSize="xsmall">{faButtons}</ButtonGroup></ButtonToolbar>;
  }
  return null;
}