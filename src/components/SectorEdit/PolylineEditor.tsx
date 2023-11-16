import {
  Tab,
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
  convertGpxToCoordinates,
  convertTcxToCoordinates,
  calculateDistanceBetweenCoordinates,
} from "../common/leaflet/geo-utils";

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
  const onDrop: DropzoneOptions["onDrop"] = useCallback(
    (files) => {
      if (files?.length !== 0) {
        const file = files[0] as any; // Missing ts-definition
        const reader = new FileReader();
        reader.onload = (e) => {
          let coords;
          if (file.path.toLowerCase().endsWith(".gpx")) {
            coords = convertGpxToCoordinates(e.target?.result as string);
          } else {
            coords = convertTcxToCoordinates(e.target?.result as string);
          }
          if (coords?.length >= 2 && parking) {
            // Reverse order if approach is drawn from crag to parking
            const distanceFromParkingToFirstPoint =
              calculateDistanceBetweenCoordinates(
                parking.latitude,
                parking.longitude,
                coords[0].latitude,
                coords[0].longitude,
              );
            const distanceFromParkingToLastPoint =
              calculateDistanceBetweenCoordinates(
                parking.latitude,
                parking.longitude,
                coords[coords.length - 1].latitude,
                coords[coords.length - 1].longitude,
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
      }
    },
    [onChange, parking],
  );

  const { getRootProps } = useDropzone({
    multiple: false,
    accept: {
      "application/gpx+xml": [".gpx"],
      "application/tcx+xml": [".tcx"],
    },
    onDrop,
  });

  return (
    <Form.Field>
      <Tab
        panes={[
          {
            menuItem: "Points",
            render: () => (
              <Tab.Pane>
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
              </Tab.Pane>
            ),
          },
          {
            menuItem: "Data",
            render: () => (
              <Tab.Pane>
                <Input
                  placeholder="Outline"
                  value={
                    coordinates
                      ?.map((c) => c.latitude + "," + c.longitude)
                      .join(";") || ""
                  }
                  onChange={(_, { value }) => onChange(parsePolyline(value))}
                  error={false && "Invalid outline"}
                />
              </Tab.Pane>
            ),
          },

          upload && {
            menuItem: "GPX/TCX",
            render: () => (
              <div {...getRootProps()} style={{ textAlign: "center" }}>
                <Message>
                  <Message.Content>
                    Drag-and-drop a <code>.gpx</code>/<code>.tcx</code> file to
                    create the approach path. These can be obtained from GPS
                    watches or from{" "}
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
          },
        ].filter(Boolean)}
      />
    </Form.Field>
  );
};
