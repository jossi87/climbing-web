import React, { useState } from "react";
import { Accordion, Icon } from "semantic-ui-react";

const AccordionContainer = ({ accordionRows }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  function handleOnClick(e, itemProps) {
    const { index } = itemProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  }
  return (
    <Accordion fluid styled attached="bottom">
      {accordionRows.map((d, i) => (
        <span key={i}>
          <Accordion.Title
            active={activeIndex === i}
            index={i}
            onClick={handleOnClick}
          >
            <Icon name="dropdown" />
            {d.label}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === i}>
            {d.length > 0 ? d.content : <i>No data</i>}
          </Accordion.Content>
        </span>
      ))}
    </Accordion>
  );
};

export default AccordionContainer;
