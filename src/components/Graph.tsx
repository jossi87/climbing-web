import { Helmet } from "react-helmet";
import { Header, Segment, Icon } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useData, useAccessToken } from "../api";
import { useMeta } from "./common/meta";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";

const Graph = () => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useData(`/graph`);

  if (!data) {
    return <Loading />;
  }
  const description = meta.isBouldering
    ? "Problems grouped by grade"
    : "Routes grouped by grade";
  return (
    <>
      <Helmet>
        <title>Graph | {meta.title}</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="area graph" />
          <Header.Content>
            Graph
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <ChartGradeDistribution
          accessToken={accessToken}
          idArea={0}
          idSector={0}
          data={data}
        />
      </Segment>
    </>
  );
};

export default Graph;
