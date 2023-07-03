import React from "react";
import { Link } from "react-router-dom";
import { Comment, Segment, Header, Table } from "semantic-ui-react";
import { Stars } from "../../common/widgets/widgets";
import Linkify from "react-linkify";
import { componentDecorator } from "../../../utils/componentDecorator";

export const ProblemTicks = ({ ticks }: { ticks: Tick[] }) => {
  return (
    <Comment.Group as={Segment}>
      <Header as="h3" dividing>
        Ticks:
      </Header>
      {ticks?.length ? (
        ticks.map((t, i) => {
          let dt = t.date;
          let com: React.ReactNode | null = null;
          if (t.repeats?.length > 0) {
            dt =
              (dt ? dt : "no-date") +
              ", " +
              t.repeats.map((x) => (x.date ? x.date : "no-date")).join(", ");
            com = (
              <Table compact unstackable size="small">
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
                {t.repeats.map((r, i) => (
                  <Table.Row key={i}>
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
              </Table>
            );
          } else {
            com = t.comment;
          }
          return (
            <Comment key={i}>
              <Comment.Avatar src={t.picture ? t.picture : "/png/image.png"} />
              <Comment.Content>
                <Comment.Author as={Link} to={`/user/${t.idUser}`}>
                  {t.name}
                </Comment.Author>
                <Comment.Metadata>{dt}</Comment.Metadata>
                <Comment.Text>
                  <Stars numStars={t.stars} includeNoRating={true} />{" "}
                  {t.suggestedGrade}
                  <br />
                  <Linkify componentDecorator={componentDecorator}>
                    {com}
                  </Linkify>
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
