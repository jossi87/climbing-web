import { Image, Label, Popup } from "semantic-ui-react";

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
      content="Sun on wall"
      trigger={
        <Label image basic size="small">
          <Image src="/svg/sun-on-wall.svg" alt="Sun on wall" size="mini" />
          {String(sunFromHour).padStart(2, "0") +
            ":00" +
            " - " +
            String(sunToHour).padStart(2, "0") +
            ":00"}
        </Label>
      }
    />
  );
};
