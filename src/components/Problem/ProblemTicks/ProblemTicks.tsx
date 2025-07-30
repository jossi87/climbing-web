import React from "react";
import { Link } from "react-router-dom";
import {
  Comment,
  Segment,
  Header,
  Table,
  Label,
  Icon,
} from "semantic-ui-react";
import { Stars } from "../../common/widgets/widgets";
import { getAvatarUrl } from "../../../api/utils";
import Linkify from "linkify-react";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  ticks: components["schemas"]["ProblemTick"][];
};

export const ProblemTicks = ({ ticks }: Props) => {
  return (
    <Comment.Group as={Segment} style={{ maxWidth: "100%" }}>
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
            <Comment
              key={[t.idUser, t.date].join("@")}
              style={{ backgroundColor: t.writable ? "#d2f8d2" : "#ffffff" }}
            >
              <Comment.Avatar
                src={
                  t.picture
                    ? getAvatarUrl(t.idUser, t.picture)
                    : "/png/image.png"
                }
              />
              <Comment.Content>
                <Comment.Author as={Link} to={`/user/${t.idUser}`}>
                  {t.name}
                </Comment.Author>
                <Comment.Metadata>{dt}</Comment.Metadata>
                <Comment.Text>
                  {t.noPersonalGrade ? (
                    <Label basic size="mini">
                      <Icon name="x" />
                      No personal grade
                    </Label>
                  ) : (
                    t.suggestedGrade
                  )}{" "}
                  <Stars numStars={t.stars} includeStarOutlines={true} />
                  <br />
                  <Linkify>{com}</Linkify>
                </Comment.Text>
              </Comment.Content>
            </Comment>
          );
        })
      ) : (
        <i>No ticks</i>
      )}
    </Comment.Group>
  );
};
