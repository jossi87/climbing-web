import { Icon, Label, Popup } from 'semantic-ui-react';

type Props = {
  sunFromHour: number;
  sunToHour: number;
};

export const SunOnWall = ({ sunFromHour, sunToHour }: Props) => {
  if (
    sunFromHour <= 0 ||
    sunToHour >= 24 ||
    sunFromHour >= sunToHour ||
    Number.isNaN(sunFromHour) ||
    Number.isNaN(sunToHour)
  ) {
    return null;
  }

  return (
    <Popup
      size='tiny'
      content='Sun on wall'
      trigger={
        <Label image basic size='tiny'>
          <Icon name='sun' />
          {String(sunFromHour).padStart(2, '0') +
            ':00' +
            ' - ' +
            String(sunToHour).padStart(2, '0') +
            ':00'}
        </Label>
      }
    />
  );
};
