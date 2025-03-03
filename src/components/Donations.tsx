import React from "react";
import { Segment, Header, Icon } from "semantic-ui-react";
import { useMeta } from "./common/meta";

const Donations = () => {
  const meta = useMeta();
  return (
    <>
      <title>{`Donations | ${meta?.title}`}</title>
      <meta name="description" content="Donations" />
      <Segment>
        <Header as="h2">
          <Icon name="money" />
          <Header.Content>
            Donations
            <Header.Subheader>
              Do you want to help keep this website ad-free?
            </Header.Subheader>
          </Header.Content>
        </Header>
        This is a nonprofit website created by climbers, for climbers.
        <br />
        <br />
        The local climbing club{" "}
        <a href="https://brv.no" rel="noreferrer noopener" target="_blank">
          BRV (Bratte Rogalands Venner)
        </a>{" "}
        pays all monthly operating expences (server and domains).
        <br />
        By the end of the year, these costs are split between the climbing clubs
        who use these services.
        <br />
        <br />
        You can help out by donating a gift{" "}
        <a
          href="https://shop.tpgo.no/#/?countryCode=NO&companyIdent=986175830"
          rel="noreferrer noopener"
          target="_blank"
        >
          here
        </a>{" "}
        (see &quot;Støtte nettfører&quot;), or joining your local climbing club
        (e.g.{" "}
        <a
          href="https://brv.no/om-brv/medlemskap/"
          rel="norefferer noopener noreferrer"
          target="_blank"
        >
          BRV
        </a>
        ).
      </Segment>
    </>
  );
};

export default Donations;
