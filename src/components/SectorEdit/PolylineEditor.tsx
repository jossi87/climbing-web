import {
  Tab,
  TabPane,
  Form,
  Label,
  Icon,
  Input,
  Button,
  Message,
} from "semantic-ui-react";
import { colorLatLng, parsePolyline } from "../../utils/polyline";
import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { components } from "../../@types/buldreinfo/swagger";
import {
  calculateDistanceBetweenCoordinates,
  parsers,
} from "../common/leaflet/geo-utils";
import { captureMessage } from "@sentry/react";

type Props = {
  coordinates: components["schemas"]["Coordinates"][];
  parking: components["schemas"]["Coordinates"];
  onChange: (polyline: components["schemas"]["Coordinates"][]) => void;
  upload?: boolean;
};

export const PolylineEditor = ({
  coordinates,
  parking,
  onChange,
  upload,
}: Props) => {
  const onDrop = useCallback(
    (files: (File & { path: string })[]) => {
      if (files?.length === 0) {
        return;
      }

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const match = file.path.toLowerCase().match(/\.([a-z]+)$/);
        if (!match) {
          captureMessage("Could not extract file extension");
          return;
        }
        const extension = match[1];

        const parser = parsers[extension];
        if (!parser) {
          captureMessage("No defined parser for file", {
            extra: { extension: extension },
          });
          return;
        }

        const coords = parser(e.target?.result as string);
        if (!coords) {
          captureMessage("Could not parse file", {
            extra: { extension: extension },
          });
          return;
        }

        if (coords.length === 0) {
          captureMessage("Parsed empty coordinates", { extra: { extension } });
          return;
        }

        if (coords.length >= 2 && parking) {
          // Reverse order if approach is drawn from crag to parking
          const distanceFromParkingToFirstPoint =
            calculateDistanceBetweenCoordinates(
              parking.latitude ?? 0,
              parking.longitude ?? 0,
              coords[0].latitude ?? 0,
              coords[0].longitude ?? 0,
            );
          const distanceFromParkingToLastPoint =
            calculateDistanceBetweenCoordinates(
              parking.latitude ?? 0,
              parking.longitude ?? 0,
              coords[coords.length - 1].latitude ?? 0,
              coords[coords.length - 1].longitude ?? 0,
            );
          if (
            distanceFromParkingToLastPoint < distanceFromParkingToFirstPoint
          ) {
            coords.reverse();
          }
        }
        onChange(coords);
      };
      reader.readAsText(file);
    },
    [onChange, parking],
  );

  const { getRootProps } = useDropzone({
    multiple: false,
    accept: {
      "application/gpx+xml": [".gpx"],
      "application/tcx+xml": [".tcx"],
    },
    onDrop: onDrop as DropzoneOptions["onDrop"],
  });

  const panes = [
    {
      menuItem: "Points",
      render: () => (
        <TabPane>
          {coordinates?.map((c, i) => {
            const [backgroundColor, color] = colorLatLng(c);
            return (
              <Label
                key={c.latitude + "," + c.longitude}
                style={{
                  backgroundColor,
                  borderColor: backgroundColor,
                  color,
                }}
              >
                Point #{i}
                <Icon
                  name="delete"
                  onClick={() => {
                    coordinates.splice(i, 1);
                    onChange(coordinates);
                  }}
                />
              </Label>
            );
          })}
        </TabPane>
      ),
    },
    {
      menuItem: "Data",
      render: () => (
        <TabPane>
          <Input
            placeholder="Outline"
            value={
              coordinates
                ?.map((c) => c.latitude + "," + c.longitude)
                .join(";") || ""
            }
            onChange={(_, { value }) => onChange(parsePolyline(value))}
          />
        </TabPane>
      ),
    },
  ];

  if (upload) {
    panes.push({
      menuItem: "GPX/TCX",
      render: () => (
        <div {...getRootProps()} style={{ textAlign: "center" }}>
          <Message>
            <Message.Content>
              Drag-and-drop a <code>.gpx</code>/<code>.tcx</code> file to create
              the approach path. These can be obtained from GPS watches or from{" "}
              <a
                href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export"
                rel="noreferrer noopener"
                target="_blank"
              >
                Strava
              </a>{" "}
              and{" "}
              <a
                href="https://help.fitbit.com/articles/en_US/Help_article/1133.htm"
                rel="noreferrer noopener"
                target="_blank"
              >
                Fitbit
              </a>
              .
              <br />
              <br />
              <Button primary>Upload</Button>
            </Message.Content>
          </Message>
        </div>
      ),
    });
  }

  return (
    <Form.Field>
      <Tab panes={panes} />
    </Form.Field>
  );
};
