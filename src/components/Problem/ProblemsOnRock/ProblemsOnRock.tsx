import React from "react";
import { Icon, Label, Table } from "semantic-ui-react";
import { useSector } from "../../../api";
import { LockSymbol, Stars } from "../../common/widgets/widgets";
import { Link } from "react-router-dom";

export const ProblemsOnRock = ({
  sectorId,
  rock,
  problemId,
}: {
  problemId: number;
  sectorId: number | undefined;
  rock: string | undefined;
}) => {
  const { data: problemsOnRock } = useSector(sectorId, {
    enabled: !!sectorId,
    select: (sectorData: any) => {
      return sectorData?.problems?.filter(
        (problem) => problem.rock && problem.rock === rock
      );
    },
    suspense: false,
  });

  if (!problemsOnRock?.length || !rock) {
    return null;
  }

  return (
    <Table.Row verticalAlign="top">
      <Table.Cell>Rock «{rock}»:</Table.Cell>
      <Table.Cell>
        {problemsOnRock.map((p, key) => (
          <Label
            key={key}
            as={Link}
            to={`/problem/${p.id}`}
            active={problemId === p.id}
          >
            #{p.nr} {p.name} {p.grade}
            <Label.Detail>
              <Stars numStars={p.stars} includeNoRating={false} />
              {p.lat > 0 && p.lng > 0 && (
                <Icon size="small" name="map marker alternate" />
              )}
              {p.hasTopo && <Icon size="small" name="paint brush" />}
              {p.hasImages > 0 && (
                <Icon size="small" color="black" name="photo" />
              )}
              {p.hasMovies > 0 && (
                <Icon size="small" color="black" name="film" />
              )}
              <LockSymbol
                lockedAdmin={p.lockedAdmin}
                lockedSuperadmin={p.lockedSuperadmin}
              />
              {p.ticked && <Icon size="small" color="green" name="check" />}
            </Label.Detail>
          </Label>
        ))}
      </Table.Cell>
    </Table.Row>
  );
};
