import {
  Label,
  Grid,
  Statistic,
  Icon,
  Image,
  Card,
  Segment,
  Placeholder,
} from "semantic-ui-react";
import Avatar from "./common/avatar/avatar";
import { Link } from "react-router-dom";
import { useMeta } from "./common/meta";
import { getImageUrl, numberWithCommas, useData } from "../api";
import Activity from "./common/activity/activity";
import { Success } from "../@types/buldreinfo";

const Frontpage = () => {
  const meta = useMeta();
  const { data: numMedia } =
    useData<Success<"getFrontpageNumMedia">>(`/frontpage/num_media`);
  const { data: numProblems } = useData<Success<"getFrontpageNumProblems">>(
    `/frontpage/num_problems`,
  );
  const { data: numTicks } =
    useData<Success<"getFrontpageNumTicks">>(`/frontpage/num_ticks`);
  const { data: randomMedia } = useData<Success<"getFrontpageRandomMedia">>(
    `/frontpage/random_media`,
  );
  const type = meta.isBouldering ? "bouldering problems" : "climbing routes";
  const description = `${numProblems?.numProblems} ${type}, ${numTicks?.numTicks} public ascents, ${numMedia?.numImages} images, ${numMedia?.numMovies} ascents on video.`;

  return (
    <>
      <title>{meta?.title}</title>
      {numMedia && numProblems && numTicks && (
        <meta name="description" content={description}></meta>
      )}
      <Grid>
        <Grid.Row>
          {numMedia && numTicks && numProblems ? (
            <Grid.Column mobile={16} tablet={8} computer={4}>
              <Statistic.Group size="mini" horizontal as={Segment}>
                <Statistic as={Link} to="/problems" color="blue">
                  <Statistic.Value>
                    <Icon name="database" />{" "}
                    {numberWithCommas(numProblems.numProblems)}
                  </Statistic.Value>
                  <Statistic.Label>
                    {meta.isBouldering ? "Problems" : "Routes"}
                  </Statistic.Label>
                </Statistic>
                {meta.isClimbing ? (
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="image outline" />{" "}
                      {numberWithCommas(numProblems.numProblemsWithTopo)}
                    </Statistic.Value>
                    <Statistic.Label>With topo</Statistic.Label>
                  </Statistic>
                ) : (
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="map marker" />{" "}
                      {numberWithCommas(numProblems.numProblemsWithCoordinates)}
                    </Statistic.Value>
                    <Statistic.Label>Coordinates</Statistic.Label>
                  </Statistic>
                )}
                <Statistic as={Link} to="/ticks/1" color="blue">
                  <Statistic.Value>
                    <Icon name="check" /> {numberWithCommas(numTicks.numTicks)}
                  </Statistic.Value>
                  <Statistic.Label>Ticks</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>
                    <Icon name="image" /> {numberWithCommas(numMedia.numImages)}
                  </Statistic.Value>
                  <Statistic.Label>Images</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>
                    <Icon name="film" /> {numberWithCommas(numMedia.numMovies)}
                  </Statistic.Value>
                  <Statistic.Label>Videos</Statistic.Label>
                </Statistic>
                <Statistic as={Link} to={"/donations"} color="blue">
                  <Statistic.Value>
                    <Icon name="money" />
                  </Statistic.Value>
                  <Statistic.Label>Donations</Statistic.Label>
                </Statistic>
              </Statistic.Group>
              {randomMedia && (
                <>
                  <Card>
                    <Link to={`/problem/${randomMedia.idProblem}`}>
                      <Image
                        size="medium"
                        style={{ maxHeight: "250px", objectFit: "cover" }}
                        src={getImageUrl(
                          randomMedia.idMedia,
                          randomMedia.crc32,
                          { minDimension: 275 },
                        )}
                      />
                    </Link>
                    <Card.Content>
                      <Card.Header
                        as={Link}
                        to={`/problem/${randomMedia.idProblem}`}
                        style={{ wordBreak: "break-all" }}
                      >
                        {randomMedia.problem}{" "}
                        <span style={{ fontWeight: "normal" }}>
                          {randomMedia.grade}
                        </span>
                      </Card.Header>
                      <Card.Description>
                        <Link to={`/area/${randomMedia.idArea}`}>
                          {randomMedia.area}
                        </Link>{" "}
                        /{" "}
                        <Link to={`/sector/${randomMedia.idSector}`}>
                          {randomMedia.sector}
                        </Link>
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Label.Group size="mini">
                        {randomMedia.tagged &&
                          randomMedia.tagged.map((x) => (
                            <Label
                              image
                              basic
                              key={x.id}
                              as={Link}
                              to={`/user/${x.id}`}
                            >
                              <Avatar
                                userId={x.id}
                                name={x.name}
                                avatarCrc32={x.avatarCrc32}
                              />
                              {x.name}
                            </Label>
                          ))}
                        {randomMedia.photographer && (
                          <Label
                            image
                            basic
                            as={Link}
                            to={`/user/${randomMedia.photographer.id}`}
                          >
                            <Avatar
                              userId={randomMedia.photographer.id}
                              name={randomMedia.photographer.name}
                              avatarCrc32={randomMedia.photographer.avatarCrc32}
                            />
                            Photog:
                            <Label.Detail color={"FFF"}>
                              {randomMedia.photographer.name}
                            </Label.Detail>
                          </Label>
                        )}
                      </Label.Group>
                    </Card.Content>
                  </Card>
                  <br />
                </>
              )}
            </Grid.Column>
          ) : (
            <Grid.Column
              mobile={16}
              tablet={8}
              computer={4}
              style={{ marginBottom: "10px" }}
            >
              <Segment>
                <Placeholder>
                  {[...Array(6)].map((_, i) => (
                    <Placeholder.Header image key={i}>
                      <Placeholder.Line />
                    </Placeholder.Header>
                  ))}
                </Placeholder>
              </Segment>
              <Card>
                <Placeholder>
                  <Placeholder.Image square />
                </Placeholder>
                <Card.Content>
                  <Placeholder>
                    <Placeholder.Header>
                      <Placeholder.Line />
                    </Placeholder.Header>
                    <Placeholder.Paragraph>
                      <Placeholder.Line />
                    </Placeholder.Paragraph>
                  </Placeholder>
                </Card.Content>
              </Card>
            </Grid.Column>
          )}
          <Grid.Column mobile={16} tablet={8} computer={12}>
            <Segment>
              <Activity idArea={0} idSector={0} />
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Frontpage;
