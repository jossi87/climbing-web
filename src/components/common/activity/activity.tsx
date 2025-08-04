import React from "react";
import { components } from "../../../@types/buldreinfo/swagger";
import { Link } from "react-router-dom";
import {
  Label,
  Icon,
  Image,
  Feed,
  Segment,
  Placeholder,
  Button,
  Dropdown,
} from "semantic-ui-react";
import LazyLoad from "react-lazyload";
import { useLocalStorage } from "../../../utils/use-local-storage";
import { useMeta } from "../../common/meta";
import { getImageUrl, useActivity } from "../../../api";
import Avatar from "../../common/avatar/avatar";
import { LockSymbol, Stars } from "./../../common/widgets/widgets";
import Linkify from "linkify-react";

type ProblemNameProps = {
  a: components["schemas"]["Activity"];
};
function ProblemName({ a }: ProblemNameProps) {
  return (
    <>
      <span style={{ opacity: 0.6, fontSize: "80%" }}>
        <Feed.User
          as={Link}
          to={`/area/${a.areaId}`}
          style={{ color: "black" }}
        >
          {a.areaName}
        </Feed.User>
        <LockSymbol
          lockedAdmin={a.areaLockedAdmin}
          lockedSuperadmin={a.areaLockedSuperadmin}
        />
        {" / "}
        <Feed.User
          as={Link}
          to={`/sector/${a.sectorId}`}
          style={{ color: "black" }}
        >
          {a.sectorName}
        </Feed.User>
        <LockSymbol
          lockedAdmin={a.sectorLockedAdmin}
          lockedSuperadmin={a.sectorLockedSuperadmin}
        />
        {" / "}
      </span>
      <Feed.User as={Link} to={`/problem/${a.problemId}`}>
        {a.problemName}
      </Feed.User>{" "}
      {a.grade}
      {a.problemSubtype && (
        <Label basic size="mini">
          {a.problemSubtype}
        </Label>
      )}
      <LockSymbol
        lockedAdmin={a.problemLockedAdmin}
        lockedSuperadmin={a.problemLockedSuperadmin}
      />
    </>
  );
}

type Props = {
  idArea: number;
  idSector: number;
};
const Activity = ({ idArea, idSector }: Props) => {
  const [lowerGradeId, setLowerGradeId] = useLocalStorage("lower_grade_id", 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage(
    "lower_grade_text",
    "n/a",
  );
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage(
    "activity_type_ticks",
    true,
  );
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage(
    "activity_type_fa",
    true,
  );
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage(
    "activity_type_comments",
    true,
  );
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage(
    "activity_type_media",
    true,
  );

  const meta = useMeta();
  const { data: activity, refetch } = useActivity({
    idArea,
    idSector,
    lowerGrade: lowerGradeId,
    fa: activityTypeFa,
    comments: activityTypeComments,
    ticks: activityTypeTicks,
    media: activityTypeMedia,
  });

  if (
    meta.grades.filter((g) => {
      const gradeText =
        g.grade.indexOf("(") > 0
          ? g.grade.substring(g.grade.indexOf("(") + 1).replace(")", "")
          : g.grade;
      return gradeText == lowerGradeText && g.id == lowerGradeId;
    }).length === 0
  ) {
    if (lowerGradeId != 0) setLowerGradeId(0);
    if (lowerGradeText != "n/a") setLowerGradeText("n/a");
    if (!activityTypeTicks) setActivityTypeTicks(true);
    if (!activityTypeFa) setActivityTypeFa(true);
    if (!activityTypeComments) setActivityTypeComments(true);
    if (!activityTypeMedia) setActivityTypeMedia(true);
  }
  const imgStyle = {
    height: "fit-content",
    maxHeight: "80px",
    objectFit: "none",
    verticalAlign: "top",
  };

  return (
    <>
      <Segment vertical style={{ paddingTop: 0 }}>
        <Button.Group size="mini" compact>
          <Dropdown
            text={"Lower grade: " + lowerGradeText}
            icon="filter"
            floating
            compact
            labeled
            button
            className="icon"
          >
            <Dropdown.Menu>
              <Dropdown.Menu scrolling>
                {meta.grades.map((a) => (
                  <Dropdown.Item
                    key={a.grade}
                    text={a.grade}
                    onClick={() => {
                      const gradeText =
                        a.grade.indexOf("(") > 0
                          ? a.grade
                              .substring(a.grade.indexOf("(") + 1)
                              .replace(")", "")
                          : a.grade;
                      refetch();
                      setLowerGradeId(a.id);
                      setLowerGradeText(gradeText);
                    }}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            animated="fade"
            inverted={!activityTypeFa}
            onClick={() => {
              refetch();
              setActivityTypeFa(!activityTypeFa);
            }}
          >
            <Button.Content hidden>FA</Button.Content>
            <Button.Content visible>
              <Icon name="plus" color="black" />
            </Button.Content>
          </Button>
          <Button
            animated="fade"
            inverted={!activityTypeTicks}
            onClick={() => {
              refetch();
              setActivityTypeTicks(!activityTypeTicks);
            }}
          >
            <Button.Content hidden>Tick</Button.Content>
            <Button.Content visible>
              <Icon name="check" color="black" />
            </Button.Content>
          </Button>
          <Button
            animated="fade"
            inverted={!activityTypeMedia}
            onClick={() => {
              refetch();
              setActivityTypeMedia(!activityTypeMedia);
            }}
          >
            <Button.Content hidden>Media</Button.Content>
            <Button.Content visible>
              <Icon name="images" color="black" />
            </Button.Content>
          </Button>
          <Button
            animated="fade"
            inverted={!activityTypeComments}
            onClick={() => {
              refetch();
              setActivityTypeComments(!activityTypeComments);
            }}
          >
            <Button.Content hidden>Comment</Button.Content>
            <Button.Content visible>
              <Icon name="comments" color="black" />
            </Button.Content>
          </Button>
        </Button.Group>
      </Segment>
      {!activity && (
        <Segment vertical>
          <Placeholder fluid>
            {[...Array(15)].map((_, i) => (
              <Placeholder.Header image key={i}>
                <Placeholder.Line length="medium" />
                <Placeholder.Line length="short" />
              </Placeholder.Header>
            ))}
          </Placeholder>
        </Segment>
      )}
      {activity && activity.length === 0 && <Segment vertical>No data</Segment>}
      {activity && activity.length != 0 && (
        <Feed>
          {activity.map((a) => {
            // FA
            if (a.users) {
              const typeDescription = meta.isBouldering ? "problem" : "route";
              return (
                <Feed.Event key={a.activityIds.join("+")}>
                  <Feed.Label>
                    {a.problemRandomMediaId > 0 && (
                      <img
                        style={{ height: "35px", objectFit: "cover" }}
                        src={getImageUrl(
                          a.problemRandomMediaId,
                          a.problemRandomMediaCrc32,
                          35,
                        )}
                      />
                    )}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      New {typeDescription} <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>{a.description}</Feed.Extra>
                    {a.media && (
                      <LazyLoad>
                        <Feed.Extra images>
                          {a.media.map((m) => (
                            <Link
                              key={m.id}
                              to={`/problem/${a.problemId}/${m.id}`}
                            >
                              <Image
                                style={imgStyle}
                                src={getImageUrl(m.id, m.crc32, 85)}
                                onError={(img) =>
                                  (img.target.src =
                                    "/png/video_placeholder.png")
                                }
                              />
                            </Link>
                          ))}
                        </Feed.Extra>
                        <br />
                      </LazyLoad>
                    )}
                    <Feed.Meta>
                      {a.users.map((u) => (
                        <Label
                          basic
                          key={u.id}
                          as={Link}
                          to={`/user/${u.id}`}
                          image
                        >
                          <Avatar
                            userId={u.id}
                            name={u.name}
                            avatarCrc32={u.avatarCrc32}
                          />{" "}
                          {u.name}
                        </Label>
                      ))}
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Guestbook
            else if (a.message) {
              return (
                <Feed.Event key={a.activityIds.join("+")}>
                  <Feed.Label>
                    <Avatar
                      userId={a.id}
                      name={a.name}
                      avatarCrc32={a.avatarCrc32}
                    />
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User
                        as={Link}
                        to={`/user/${a.id}`}
                        style={{ color: "black" }}
                      >
                        {a.name}
                      </Feed.User>{" "}
                      posted a comment on <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>
                      <Linkify>{a.message}</Linkify>
                    </Feed.Extra>
                    {a.media && (
                      <LazyLoad>
                        <Feed.Extra images>
                          {a.media.map((m) => (
                            <Link
                              key={m.id}
                              to={`/problem/${a.problemId}/${m.id}`}
                            >
                              <Image
                                style={imgStyle}
                                src={getImageUrl(m.id, m.crc32, 85)}
                                onError={(i) =>
                                  (i.target.src = "/png/video_placeholder.png")
                                }
                              />
                            </Link>
                          ))}
                        </Feed.Extra>
                        <br />
                      </LazyLoad>
                    )}
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Media
            else if (a.media) {
              const [numImg, numMov] = a.media.reduce(
                (acc, { movie }) => {
                  if (movie) {
                    return [acc[0], acc[1] + 1];
                  } else {
                    return [acc[0] + 1, acc[1]];
                  }
                },
                [0, 0],
              );
              const img = numImg > 0 && (
                <>
                  {numImg} new <Icon name="photo" />
                </>
              );
              const mov = numMov > 0 && (
                <>
                  {numMov} new <Icon name="film" />
                </>
              );
              let summary;
              if (img && mov) {
                summary = (
                  <>
                    {img} and {mov}
                  </>
                );
              } else if (mov) {
                summary = mov;
              } else {
                summary = img;
              }
              return (
                <Feed.Event key={a.activityIds.join("+")}>
                  <Feed.Label>
                    {a.problemRandomMediaId > 0 && (
                      <img
                        style={{ height: "35px", objectFit: "cover" }}
                        src={getImageUrl(
                          a.problemRandomMediaId,
                          a.problemRandomMediaCrc32,
                          35,
                        )}
                      />
                    )}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary style={{ marginBottom: "3px" }}>
                      {summary}on <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <LazyLoad>
                      <Feed.Extra images>
                        {a.media.map((m) => (
                          <Link
                            key={m.id}
                            to={`/problem/${a.problemId}/${m.id}`}
                          >
                            <Image
                              style={imgStyle}
                              src={getImageUrl(m.id, m.crc32, 85)}
                              onError={(img) =>
                                (img.target.src = "/png/video_placeholder.png")
                              }
                            />
                          </Link>
                        ))}
                      </Feed.Extra>
                    </LazyLoad>
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Tick
            else {
              const action = a.repeat ? "repeated" : "ticked";
              return (
                <Feed.Event key={a.activityIds.join("+")}>
                  <Feed.Label>
                    <Avatar
                      userId={a.id}
                      name={a.name}
                      avatarCrc32={a.avatarCrc32}
                    />
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User
                        as={Link}
                        to={`/user/${a.id}`}
                        style={{ color: "black" }}
                      >
                        {a.name}
                      </Feed.User>{" "}
                      {action} <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    {a.description && (
                      <Feed.Extra text>{a.description}</Feed.Extra>
                    )}
                    {(a.noPersonalGrade || a.stars != 0) && (
                      <Feed.Meta>
                        {a.noPersonalGrade && (
                          <Label basic size="mini">
                            <Icon name="x" />
                            No personal grade
                          </Label>
                        )}
                        {a.stars != 0 && (
                          <Stars
                            numStars={a.stars}
                            includeStarOutlines={true}
                          />
                        )}
                      </Feed.Meta>
                    )}
                  </Feed.Content>
                </Feed.Event>
              );
            }
          })}
        </Feed>
      )}
    </>
  );
};

export default Activity;
