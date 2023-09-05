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
import GpxParser from "gpxparser";
import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { components } from "../../@types/buldreinfo/swagger";

type Props = {
  coordinates: components["schemas"]["Coordinates"][];
  onChange: (polyline: components["schemas"]["Coordinates"][]) => void;
  upload?: boolean;
};

export const PolylineEditor = ({ coordinates, onChange, upload }: Props) => {
  const onDrop: DropzoneOptions["onDrop"] = useCallback(
    (files) => {
      if (files?.length !== 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const gpx = new GpxParser();
          gpx.parse(e.target?.result as string);
          const coordinates = gpx.tracks[0]?.points?.map((e) => ({
            latitude: e.lat,
            longitude: e.lon,
          }));
          onChange(coordinates);
        };
        reader.readAsText(files[0]);
      }
    },
    [onChange],
  );

  const { getRootProps } = useDropzone({
    multiple: false,
    accept: { "application/gpx+xml": [".gpx"] },
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
            menuItem: "GPX",
            render: () => (
              <div {...getRootProps()} style={{ textAlign: "center" }}>
                <Message>
                  <Message.Content>
                    Drag-and-drop a <code>.gpx</code> file to create the
                    approach path. These can be obtained from GPS watches or
                    from{" "}
                    <a
                      href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export"
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      Strava
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
