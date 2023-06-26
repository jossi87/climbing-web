import { Helmet } from "react-helmet";
import { Header, Segment, Icon } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useData } from "../api";
import { useMeta } from "./common/meta";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";

const Graph = () => {
  const meta = useMeta();
  const { data } = useData(`/graph`);

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Graph | {meta.title}</title>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="area graph" />
          <Header.Content>
            Graph
          </Header.Content>
        </Header>
        <ChartGradeDistribution
          accessToken={data.accessToken}
          idArea={0}
          idSector={0}
          data={data}
        />
      </Segment>
    </>
  );
};

export default Graph;
