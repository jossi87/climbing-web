import { Icon, Label, Table } from 'semantic-ui-react';
import { useSector } from '../../../api';
import { LockSymbol, Stars } from '../../common/widgets/widgets';
import { Link } from 'react-router-dom';

const useProblemsOnRock = ({
  sectorId,
  rock,
}: {
  sectorId: number | undefined;
  rock: string | undefined;
}) => {
  const { data } = useSector(sectorId);
  return data?.problems
    ?.filter((problem) => problem.rock && problem.rock === rock)
    .sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0));
};

export const ProblemsOnRock = ({
  sectorId,
  rock,
  problemId,
}: {
  problemId: number;
  sectorId: number | undefined;
  rock: string | undefined;
}) => {
  const problemsOnRock = useProblemsOnRock({ sectorId, rock });

  if (!problemsOnRock?.length || !rock) {
    return null;
  }

  return (
    <Table.Row verticalAlign='top'>
      <Table.Cell>Rock «{rock}»:</Table.Cell>
      <Table.Cell>
        {problemsOnRock.map((p) => (
          <Label key={p.id} as={Link} to={`/problem/${p.id}`} active={problemId === p.id}>
            #{p.nr} {p.name} {p.grade}
            <Label.Detail>
              <Stars numStars={p.stars} includeStarOutlines={false} />
              {p.coordinates && <Icon size='small' name='map marker alternate' />}
              {p.hasTopo && <Icon size='small' name='paint brush' />}
              {p.hasImages && <Icon size='small' color='black' name='photo' />}
              {p.hasMovies && <Icon size='small' color='black' name='film' />}
              <LockSymbol lockedAdmin={p.lockedAdmin} lockedSuperadmin={p.lockedSuperadmin} />
              {p.ticked && <Icon size='small' color='green' name='check' />}
            </Label.Detail>
          </Label>
        ))}
      </Table.Cell>
    </Table.Row>
  );
};
