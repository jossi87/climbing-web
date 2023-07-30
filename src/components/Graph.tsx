import { Helmet } from "react-helmet";
import { Header, Segment, Icon } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useData } from "../api";
import { useMeta } from "./common/meta";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";
import { Success } from "../@types/buldreinfo";

const Graph = () => {
  const meta = useMeta();
  const { data } = useData<Success<"getGraph">>(`/graph`);

  if (!data) {
    return <Loading />;
  }
  const description = meta.isBouldering
    ? "Problems grouped by grade"
    : "Routes grouped by grade";
  return (
    <>
      <Helmet>
        <title>Graph</title>
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
        <ChartGradeDistribution idArea={0} idSector={0} data={data} />
      </Segment>
    </>
  );
};

export default Graph;
