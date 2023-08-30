import {
  Tab,
  Form,
  Label,
  Icon,
  Input,
  Button,
  Message,
} from "semantic-ui-react";
import { parsePolyline, colorLatLng } from "../../utils/polyline";
import GpxParser from "gpxparser";
import { useCallback } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

type Props = {
  polyline: string | undefined;
  onChange: (polyline: string) => void;
  upload?: boolean;
};

export const PolylineEditor = ({ polyline, onChange, upload }: Props) => {
  const onDrop: DropzoneOptions["onDrop"] = useCallback(
    (files) => {
      if (files?.length !== 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const gpx = new GpxParser();
          gpx.parse(e.target?.result as string);
          const polyline = gpx.tracks[0]?.points
            ?.map((e) => e.lat + "," + e.lon)
            .join(";");
          onChange(polyline);
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
                {parsePolyline(polyline)?.map((latlng, i) => {
                  const [backgroundColor, color] = colorLatLng(latlng);
                  return (
                    <Label
                      key={latlng.join(",")}
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
                          const trimmed = [...parsePolyline(polyline)];
                          trimmed.splice(i, 1);
                          onChange(
                            trimmed.map((latlng) => latlng.join(",")).join(";"),
                          );
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
                  value={polyline || ""}
                  onChange={(_, { value }) => onChange(value)}
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
