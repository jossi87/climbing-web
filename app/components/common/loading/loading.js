import {Component} from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/fontawesome-free-solid';

export default class Loading extends Component {
  render() {
    return (
      <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>
    );
  }
}
