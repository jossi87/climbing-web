import React, {Component} from 'react';
import { Well } from 'react-bootstrap';


class Callback extends Component {
  componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      this.props.auth.handleAuthentication();
    }
  }

  render() {
    return <Well>Signing in, please wait...</Well>;
  }
}

export default Callback;
