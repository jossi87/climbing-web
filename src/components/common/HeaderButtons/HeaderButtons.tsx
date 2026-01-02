import { ComponentProps, ReactNode } from 'react';
import { ButtonGroup, Header, Icon } from 'semantic-ui-react';

type Props = {
  icon?: ComponentProps<typeof Icon>['name'];
  header?: string;
  subheader?: ReactNode;
  children?: ReactNode | ReactNode[];
};

export const HeaderButtons = ({ header, subheader, icon, children }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap-reverse',
        alignItems: 'flex-end',
      }}
    >
      {header && (
        <Header as='h2' style={{ marginBottom: 0 }}>
          {icon && <Icon name={icon} />}
          <Header.Content>
            {header}
            {subheader && (
              <Header.Subheader style={{ lineWrap: 'no-wrap' }}>{subheader}</Header.Subheader>
            )}
          </Header.Content>
        </Header>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexGrow: 1,
          marginBottom: 10,
        }}
      >
        <ButtonGroup size='mini'>{children}</ButtonGroup>
      </div>
    </div>
  );
};
