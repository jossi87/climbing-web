import React, { useCallback, useState } from "react";
import { Accordion, Icon } from "semantic-ui-react";

type Props = {
  accordionRows: {
    label: string;
    length?: number;
    content: React.ReactNode | string;
  }[];
};

const AccordionContainer = ({ accordionRows }: Props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const handleOnClick = useCallback((_, { index }) => {
    setActiveIndex((oldValue) => (oldValue === index ? -1 : index));
  }, []);

  return (
    <Accordion fluid styled attached="bottom">
      {accordionRows.map((d, i) => (
        <span key={d.label}>
          <Accordion.Title
            active={activeIndex === i}
            index={i}
            onClick={handleOnClick}
          >
            <Icon name="dropdown" />
            {d.label}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === i}>
            {(d.length ?? 0) > 0 ? d.content : <i>No data</i>}
          </Accordion.Content>
        </span>
      ))}
    </Accordion>
  );
};

export default AccordionContainer;
