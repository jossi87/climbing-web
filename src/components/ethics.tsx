import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Segment } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getMeta } from '../api';

const Ethics = () => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    getMeta(accessToken).then((data) => setData(data));
  }, [accessToken]);

  return (
    <>
      <MetaTags>
        {data && <title>{"Ethics | " + data.metadata.title}</title>}
        <meta name="description" content={"Ethics and privacy policy"} />
      </MetaTags>
      <Segment>
        <h3>Ethics</h3>
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
      </Segment>
      <Segment>
        <h3>Privacy Policy</h3>
        We respect your privacy and handle your data with the care that we would expect our own data to be handled. We will never sell or pass on your information to any third party. You can delete any of your profile information at any time, <a href="mailto:jostein.oygarden@gmail.com">send us an e-mail</a> with the data you want to delete.
      </Segment>
    </>
  );
}

export default Ethics;
