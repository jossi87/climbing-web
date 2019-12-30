import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Container, Header } from 'semantic-ui-react';

export default class NoMatch extends Component {
  render() {
    return (
      <React.Fragment>
        <MetaTags>
          <title>Page not found</title>
        </MetaTags>
        <Container>
          <Header as="h1">404</Header>
          Page not found
        </Container>
      </React.Fragment>
    );
  }
}
