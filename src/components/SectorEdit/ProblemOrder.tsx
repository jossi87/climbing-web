import { useRef } from "react";
import { components } from "../../@types/buldreinfo/swagger";
import { Input } from "semantic-ui-react";

type Props = Pick<components["schemas"]["Sector"], "problemOrder"> & {
  onChange: (
    order: NonNullable<components["schemas"]["Sector"]["problemOrder"]>,
  ) => void;
};

export const ProblemOrder = ({ problemOrder, onChange }: Props) => {
  const originalOrder = useRef(
    (problemOrder ?? []).reduce(
      (acc, { id, nr }) => ({ ...acc, [id]: nr }),
      {},
    ),
  ).current;

  return problemOrder.map(({ id, name, nr }) => {
    const isModified = nr !== originalOrder[id];
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
  });
};
