import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Well } from 'react-bootstrap';

export default class NoMatch extends Component {
  render() {
    return (
      <React.Fragment>
        <MetaTags>
          <title>Page not found</title>
        </MetaTags>
        <Well>
          <h1>404</h1>
          Page not found
        </Well>
      </React.Fragment>
    );
  }
}
