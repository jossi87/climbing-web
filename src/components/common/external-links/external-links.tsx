import React, { ComponentProps, useCallback, useState } from "react";
import { Form, Input, Dropdown, Segment } from "semantic-ui-react";
import { components } from "../../../@types/buldreinfo/swagger";

type ExternalLink = components["schemas"]["ExternalLink"][];

type Props = {
  externalLinks: ExternalLink;
  onExternalLinksUpdated: (externalLinks: ExternalLink) => void;
};

const ExternalLinks = ({
  externalLinks: initExternalLinks,
  onExternalLinksUpdated,
}: Props) => {
  const [externalLinks, setExternalLinks] = useState(initExternalLinks);

  const onNumberOfExternalLinksChange: NonNullable<
    ComponentProps<typeof Dropdown>["onChange"]
  > = useCallback(
    (e, { value }) => {
      const num = +value;
      let newExternalLinks: ExternalLink = [];
      if (num > 0) {
        newExternalLinks = externalLinks ? [...externalLinks] : [];
        while (num > newExternalLinks.length) {
          newExternalLinks.push({
            url: null,
            title: null,
          });
        }
        while (num < newExternalLinks.length) {
          newExternalLinks.pop();
        }
      }
      onExternalLinksUpdated(newExternalLinks);
      setExternalLinks(newExternalLinks);
    },
    [onExternalLinksUpdated, externalLinks],
  );

  return (
    <Segment>
      <Form.Field>
        <label>
          <Dropdown
            inline
            value={externalLinks?.length}
            onChange={onNumberOfExternalLinksChange}
            options={[
              { key: 0, value: 0, text: "No external links" },
              { key: 1, value: 1, text: "1 external link" },
              { key: 2, value: 2, text: "2 external links" },
              { key: 3, value: 3, text: "3 external links" },
              { key: 4, value: 4, text: "4 external links" },
              { key: 5, value: 5, text: "5 external links" },
            ]}
          />
        </label>
        {externalLinks?.length !== 0 &&
          externalLinks.map((l) => (
            <Form.Group widths="equal" key={l.id} inline>
              <Form.Field>
                <Input
                  size="mini"
                  icon="linkify"
                  iconPosition="left"
                  fluid
                  placeholder="URL"
                  value={l.url || ""}
                  onChange={(e, { value }) => {
                    l.url = value;
                    setExternalLinks([...externalLinks]);
                    onExternalLinksUpdated(externalLinks);
                  }}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  size="mini"
                  icon="font"
                  iconPosition="left"
                  fluid
                  placeholder="Title"
                  value={l.title || ""}
                  onChange={(e, { value }) => {
                    l.title = value;
                    setExternalLinks([...externalLinks]);
                    onExternalLinksUpdated(externalLinks);
                  }}
                />
              </Form.Field>
            </Form.Group>
          ))}
      </Form.Field>
    </Segment>
  );
};

export default ExternalLinks;
