import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function LockSymbol(props) {
  if (props.visibility===1) {
    return <FontAwesomeIcon icon="lock" />
  } else if (props.visibility===2) {
    return <FontAwesomeIcon icon="user-secret" />
  }
  return null;
}
