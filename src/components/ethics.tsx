import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Container } from 'semantic-ui-react';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';

class Ethics extends Component<any, any> {
  componentDidMount() {
    if (!this.state || !this.state.data) {
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  render() {
    if (!this.state || !this.state.data) {
      return <LoadingAndRestoreScroll />;
    }
    return (
      <React.Fragment>
        <MetaTags>
          {this.state.data && <title>{"Ethics | " + this.state.data.metadata.title}</title>}
          <meta name="description" content={"Ethics and privacy policy"} />
        </MetaTags>
        <Container>
          If you&#39;re going out climbing, we ask you to please follow these guidelines for the best possible bouldering experience now, and for the future generations of climbers.<br/>
          <ul>
            <li>Show respect for the landowners, issue care and be polite.</li>
            <li>Follow paths where possible, and do not cross cultivated land.</li>
            <li>Take your trash back with you.</li>
            <li>Park with reason, and think of others. Make room for potential tractors and such if necessary.</li>
            <li>Start where directed, and don&#39;t hesitate to ask if your unsure.</li>
            <li>Sit start means that the behind should be the last thing to leave the ground/crashpad.</li>
            <li>No chipping allowed.</li>
            <li>Remember climbing can be dangerous and always involves risk. Your safety is your own responsibility.</li>
            <li>Use common sense!</li>
          </ul>
        </Container>
        <h3>Privacy Policy</h3>
        We respect your privacy and handle your data with the care that we would expect our own data to be handled. We will never sell or pass on your information to any third party. You can delete any of your profile information at any time, <a href="mailto:jostein.oygarden@gmail.com">send us an e-mail</a> with the data you want to delete.
      </React.Fragment>
    );
  }
}

export default Ethics;
