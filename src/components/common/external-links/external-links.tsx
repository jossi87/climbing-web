import { type ComponentProps, useCallback, useMemo } from 'react';
import { Form, Input, Dropdown, Segment } from 'semantic-ui-react';
import type { components } from '../../../@types/buldreinfo/swagger';

type ExternalLink = components['schemas']['ExternalLink'];
type ExternalLinksArray = ExternalLink[];

type Props = {
  externalLinks: ExternalLinksArray;
  onExternalLinksUpdated: (externalLinks: ExternalLinksArray) => void;
};

const ExternalLinks = ({ externalLinks, onExternalLinksUpdated }: Props) => {
  // Fixes: react-hooks/exhaustive-deps
  // This ensures 'links' has a stable reference if externalLinks is null/undefined
  const links = useMemo(() => externalLinks || [], [externalLinks]);

  const handleLinkChange = (
    index: number,
    field: keyof ExternalLink,
    value: string | undefined,
  ) => {
    const updatedLinks = links.map((link, i) => {
      if (i === index) {
        return { ...link, [field]: value };
      }
      return link;
    });

    onExternalLinksUpdated(updatedLinks);
  };

  const onNumberOfExternalLinksChange: NonNullable<ComponentProps<typeof Dropdown>['onChange']> =
    useCallback(
      (e, { value }) => {
        const num = +(value ?? 0);
        let newExternalLinks: ExternalLinksArray = [...links];

        if (num > newExternalLinks.length) {
          while (num > newExternalLinks.length) {
            newExternalLinks.push({
              url: undefined,
              title: undefined,
            });
          }
        } else if (num < newExternalLinks.length) {
          newExternalLinks = newExternalLinks.slice(0, num);
        }

        onExternalLinksUpdated(newExternalLinks);
      },
      [onExternalLinksUpdated, links],
    );

  return (
    <Segment>
      <Form.Field>
        <label>
          <Dropdown
            inline
            value={links.length}
            onChange={onNumberOfExternalLinksChange}
            options={[
              { key: 0, value: 0, text: 'No external links' },
              { key: 1, value: 1, text: '1 external link' },
              { key: 2, value: 2, text: '2 external links' },
              { key: 3, value: 3, text: '3 external links' },
              { key: 4, value: 4, text: '4 external links' },
              { key: 5, value: 5, text: '5 external links' },
            ]}
          />
        </label>

        {links.length > 0 &&
          links.map((l, index) => (
            <Form.Group widths='equal' key={index} inline>
              <Form.Field>
                <Input
                  size='mini'
                  icon='linkify'
                  iconPosition='left'
                  fluid
                  placeholder='URL'
                  value={l.url || ''}
                  onChange={(_e, { value }) =>
                    handleLinkChange(index, 'url', value === '' ? undefined : String(value))
                  }
                />
              </Form.Field>
              <Form.Field>
                <Input
                  size='mini'
                  icon='font'
                  iconPosition='left'
                  fluid
                  placeholder='Title'
                  value={l.title || ''}
                  onChange={(_e, { value }) =>
                    handleLinkChange(index, 'title', value === '' ? undefined : String(value))
                  }
                />
              </Form.Field>
            </Form.Group>
          ))}
      </Form.Field>
    </Segment>
  );
};

export default ExternalLinks;
