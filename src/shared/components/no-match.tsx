import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';

export default class NoMatch extends Component {
  render() {
    return (
      <React.Fragment>
        <MetaTags>
          <title>Page not found</title>
        </MetaTags>
        <h1>404</h1>
        Page not found
      </React.Fragment>
    );
  }
}
