import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Breadcrumb, Well } from 'react-bootstrap';
import config from '../utils/config.js';

export default class Ethics extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Ethics")}</title>
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <font color='#777'>Ethics</font>
        </Breadcrumb>
        <Well>
          If you&#39;re going out climbing, we ask you to please follow these guidelines for the best possible bouldering experience now, and for the future generations of climbers.<br/><br/>
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
        </Well>
        <Well>
          <h3>Privacy Policy</h3>
          We respect your privacy and handle your data with the care that we would expect our own data to be handled. We will never sell or pass on your information to any third party. You can delete any of your profile information at any time, <a href="mailto:jostein.oygarden@gmail.com">send us an e-mail</a> with the data you want to delete. The Android app requests permissions like accounts and camera. Accounts are used to give you correct data according to your permissions in buldreinfo. The camera can be used inside the app to append new images to existing bouldering problems (pending approval by an administrator).
        </Well>
      </span>
    );
  }
}
