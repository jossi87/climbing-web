import { useRef } from "react";
import { components } from "../../@types/buldreinfo/swagger";
import { Input } from "semantic-ui-react";

type Props = Pick<components["schemas"]["Sector"], "problemOrder"> & {
  onChange: (
    order: NonNullable<components["schemas"]["Sector"]["problemOrder"]>,
  ) => void;
};

/**
 * This is just to work around the fact that _technically_ a Problem doesn't
 * "need" to have an {@code id} field, since it's defined as optional in the
 * Swagger-generated APIs. But we know that it'll be there and we can skip this.
 */
const TYPE_IMPOSSIBILITY = 0;

export const ProblemOrder = ({ problemOrder, onChange }: Props) => {
  const originalOrder: Record<number, number> = useRef(
    (problemOrder ?? []).reduce(
      (acc, { id, nr }) => ({ ...acc, [id ?? TYPE_IMPOSSIBILITY]: nr }),
      {},
    ),
  ).current;

  return (
    problemOrder?.map(({ id, name, nr }) => {
      const isModified = nr !== originalOrder[id ?? TYPE_IMPOSSIBILITY];
      const color = isModified ? "orange" : "grey";
      return (
        <Input
          key={id}
          size="small"
          type="number"
          step={1}
          fluid
          icon="hashtag"
          iconPosition="left"
          placeholder="Number"
          defaultValue={nr}
          label={{ basic: true, content: name, color }}
          labelPosition="right"
          onChange={(_, { value }) => {
            const num = +value;
            onChange(
              problemOrder.map((problem) => {
                if (problem.id === id) {
                  return {
                    ...problem,
                    nr: num,
                  };
                }
                return problem;
              }),
            );
          }}
        />
      );
    }) ?? []
  );
};
