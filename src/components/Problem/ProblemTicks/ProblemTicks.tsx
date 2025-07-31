import React from "react";
import { Link } from "react-router-dom";
import { Feed, Segment, Header, Table, Label, Icon } from "semantic-ui-react";
import Avatar from "../../common/avatar/avatar";
import { Stars } from "../../common/widgets/widgets";
import Linkify from "linkify-react";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  ticks: components["schemas"]["ProblemTick"][];
};

export const ProblemTicks = ({ ticks }: Props) => {
  return (
    <Segment as={Feed} style={{ maxWidth: "100%" }}>
      <Header as="h3" dividing>
        Ticks
        {ticks?.length > 0 && <Label circular>{ticks.length}</Label>}
      </Header>
      {ticks?.length ? (
        ticks.map((t) => {
          let dt = t.date;
          let com: React.ReactNode | null = null;
          if (t.repeats?.length > 0) {
            dt =
              (dt ? dt : "no-date") +
              ", " +
              t.repeats.map((x) => (x.date ? x.date : "no-date")).join(", ");
            com = (
              <Table collapsing compact unstackable size="small">
                <Table.Body>
                  <Table.Row>
                    <Table.Cell
                      verticalAlign="top"
                      singleLine
                      className="metadata"
                    >
                      {t.date ? t.date : "no-date"}
                    </Table.Cell>
                    <Table.Cell verticalAlign="top">{t.comment}</Table.Cell>
                  </Table.Row>
                  {t.repeats.map((r) => (
                    <Table.Row key={[r.date, r.comment].join("/")}>
                      <Table.Cell
                        verticalAlign="top"
                        singleLine
                        className="metadata"
                      >
                        {r.date ? r.date : "no-date"}
                      </Table.Cell>
                      <Table.Cell>{r.comment}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            );
          } else {
            com = t.comment;
          }
          return (
            <Feed.Event
              key={[t.idUser, t.date].join("@")}
              style={{
                padding: 0,
                backgroundColor: t.writable ? "#d2f8d2" : "#ffffff",
              }}
            >
              <Feed.Label>
                <Avatar userId={t.idUser} avatarCrc32={t.avatarCrc32} />
              </Feed.Label>
              <Feed.Content>
                <Feed.Summary>
                  <Feed.User as={Link} to={`/user/${t.idUser}`}>
                    {t.name}
                  </Feed.User>
                  <Feed.Date>{dt}</Feed.Date>
                </Feed.Summary>
                {t.noPersonalGrade ? (
                  <Label basic size="mini">
                    <Icon name="x" />
                    No personal grade
                  </Label>
                ) : (
                  t.suggestedGrade
                )}{" "}
                <Stars numStars={t.stars} includeStarOutlines={true} />
                {com && (
                  <Linkify>
                    <br />
                    {com}
                  </Linkify>
                )}
              </Feed.Content>
            </Feed.Event>
          );
        })
      ) : (
        <i>No ticks</i>
      )}
    </Segment>
  );
};
