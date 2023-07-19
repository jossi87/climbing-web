import React, { useState } from "react";
import { Form, Input, Dropdown } from "semantic-ui-react";

const ProblemSection = ({
  sections: initSections,
  grades,
  onSectionsUpdated,
}) => {
  const [sections, setSections] = useState(initSections);

  function onNumberOfSectionsChange(e, { value }) {
    const num = parseInt(value);
    let newSections = null;
    if (num > 1) {
      newSections = sections ? [...sections] : [];
      while (num > newSections.length) {
        newSections.push({
          id: newSections.length * -1,
          nr: newSections.length + 1,
          grade: "n/a",
          description: null,
        });
      }
      while (num < newSections.length) {
        newSections.pop();
      }
    }
    onSectionsUpdated(newSections);
    setSections(newSections);
  }

  return (
    <>
      <Dropdown
        selection
        value={sections ? sections.length : 1}
        onChange={onNumberOfSectionsChange}
        options={[
          { key: 1, value: 1, text: 1 },
          { key: 2, value: 2, text: 2 },
          { key: 3, value: 3, text: 3 },
          { key: 4, value: 4, text: 4 },
          { key: 5, value: 5, text: 5 },
          { key: 6, value: 6, text: 6 },
          { key: 7, value: 7, text: 7 },
          { key: 8, value: 8, text: 8 },
          { key: 9, value: 9, text: 9 },
          { key: 10, value: 10, text: 10 },
          { key: 11, value: 11, text: 11 },
          { key: 12, value: 12, text: 12 },
          { key: 13, value: 13, text: 13 },
          { key: 14, value: 14, text: 14 },
          { key: 15, value: 15, text: 15 },
          { key: 16, value: 16, text: 16 },
          { key: 17, value: 17, text: 17 },
          { key: 18, value: 18, text: 18 },
          { key: 19, value: 19, text: 19 },
          { key: 20, value: 20, text: 20 },
          { key: 21, value: 21, text: 21 },
          { key: 22, value: 22, text: 22 },
          { key: 23, value: 23, text: 23 },
          { key: 24, value: 24, text: 24 },
          { key: 25, value: 25, text: 25 },
          { key: 26, value: 26, text: 26 },
          { key: 27, value: 27, text: 27 },
          { key: 28, value: 28, text: 28 },
          { key: 29, value: 29, text: 29 },
          { key: 30, value: 30, text: 30 },
        ]}
      />
      {sections &&
        sections.length > 1 &&
        sections.map((s) => (
          <Form.Group widths="equal" key={s.nr} inline>
            <Form.Field>
              <Input
                size="mini"
                icon="hashtag"
                iconPosition="left"
                fluid
                placeholder="Number"
                value={s.nr}
                onChange={(e, { value }) => {
                  s.nr = parseInt(value);
                  setSections([...sections]);
                  onSectionsUpdated(sections);
                }}
              />
            </Form.Field>
            <Form.Field>
              <Dropdown
                size="mini"
                icon="dropdown"
                fluid
                selection
                value={s.grade}
                onChange={(e, { value }) => {
                  s.grade = value;
                  setSections([...sections]);
                  onSectionsUpdated(sections);
                }}
                options={grades.map((g, i) => ({
                  key: i,
                  value: g.grade,
                  text: g.grade,
                }))}
              />
            </Form.Field>
            <Form.Field>
              <Input
                size="mini"
                icon="info"
                iconPosition="left"
                fluid
                placeholder="Description"
                value={s.description ? s.description : ""}
                onChange={(e, { value }) => {
                  s.description = value;
                  setSections([...sections]);
                  onSectionsUpdated(sections);
                }}
              />
            </Form.Field>
          </Form.Group>
        ))}
    </>
  );
};

export default ProblemSection;
