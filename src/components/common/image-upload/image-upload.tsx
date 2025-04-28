import React, { useEffect, useState, useCallback, ComponentProps } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { Button, Card, Image, Input, Checkbox } from "semantic-ui-react";
import VideoEmbedder from "./video-embedder";
import { UserSelector } from "../user-selector/user-selector";
import { components } from "../../../@types/buldreinfo/swagger";
import { useMeta } from "../../common/meta";

type UploadedMedia = {
  file?: File;
  preview?: string;
} & components["schemas"]["NewMedia"];

type Props = {
  onMediaChanged: (newMedia: UploadedMedia[]) => void;
  isMultiPitch: boolean;
};

const different = (a: UploadedMedia, b: UploadedMedia) => {
  return a.preview !== b.preview || a.embedThumbnailUrl !== b.embedThumbnailUrl;
};

const ImageUpload = ({ onMediaChanged, isMultiPitch }: Props) => {
  const meta = useMeta();
  const [media, setMedia] = useState<UploadedMedia[]>([]);

  useEffect(() => {
    onMediaChanged(media as UploadedMedia[]);
  }, [media, onMediaChanged]);

  const onDrop = useCallback<DropzoneOptions["onDrop"]>(
    (acceptedFiles) => {
      setMedia((existing) => [
        ...existing,
        ...acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          photographer: meta?.authenticatedName,
        })),
      ]);
    },
    [meta],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  const addMedia = useCallback<
    ComponentProps<typeof VideoEmbedder>["addMedia"]
  >(({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds }) => {
    setMedia((old) => [
      ...old,
      { embedVideoUrl, embedThumbnailUrl, embedMilliseconds },
    ]);
  }, []);

  return (
    <>
      <div
        {...getRootProps()}
        style={{
          padding: "15px",
          borderWidth: "1px",
          borderColor: "#666",
          borderStyle: "dashed",
          borderRadius: "5px",
          backgroundColor: "white",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <p>Drop images here, or click to select files to upload.</p>
        )}
      </div>
      <br />
      <VideoEmbedder addMedia={addMedia} />
      {media.length > 0 && (
        <>
          <br />
          <br />
          <Card.Group itemsPerRow={4} stackable>
            {media.map((m) => {
              const key = m.preview ?? m.embedThumbnailUrl;

              const updateItem = (patch: Partial<typeof m>) =>
                setMedia((oldValue) =>
                  oldValue.map((item) =>
                    different(item, m) ? item : { ...item, ...patch },
                  ),
                );

              let min = 0;
              let sec = 0;
              if (
                m.embedThumbnailUrl &&
                m.embedMilliseconds &&
                m.embedMilliseconds > 0
              ) {
                min = Math.floor((m.embedMilliseconds / 1000 / 60) << 0);
                sec = Math.floor((m.embedMilliseconds / 1000) % 60);
              }

              return (
                <Card key={key}>
                  <Image src={m.preview ?? m.embedThumbnailUrl} />
                  <Card.Content>
                    {isMultiPitch && (
                      <Input
                        size="mini"
                        icon="hashtag"
                        iconPosition="left"
                        fluid
                        placeholder="Pitch"
                        value={m.pitch}
                        onChange={(_, { value }) => {
                          updateItem({ pitch: +value });
                        }}
                      />
                    )}
                    <Input
                      size="mini"
                      icon="comment"
                      iconPosition="left"
                      fluid
                      placeholder="Description"
                      value={m.description ?? ""}
                      onChange={(_, { value }) => {
                        updateItem({ description: value });
                      }}
                    />
                    <Checkbox
                      label="Trivia"
                      toggle
                      checked={m.trivia}
                      onChange={() => {
                        updateItem({ trivia: !m.trivia });
                      }}
                    />
                    <UserSelector
                      placeholder="In photo/video"
                      defaultValue={m.inPhoto}
                      onUserUpdated={(u) => {
                        updateItem({ inPhoto: u?.label });
                      }}
                    />
                    <UserSelector
                      placeholder="Photographer"
                      defaultValue={m.photographer}
                      onUserUpdated={(u) => {
                        updateItem({ photographer: u?.label });
                      }}
                    />
                    {m.embedThumbnailUrl && (
                      <>
                        <label>Start video at:</label>
                        <Input
                          size="mini"
                          label="Min"
                          value={min}
                          onChange={(_, { value }) => {
                            const val = +value;
                            const ms = (val * 60 + sec) * 1000;
                            updateItem({ embedMilliseconds: ms });
                          }}
                        />
                        <Input
                          size="mini"
                          label="Sec"
                          value={sec}
                          onChange={(_, { value }) => {
                            const val = +value;
                            const ms = (min * 60 + val) * 1000;
                            updateItem({ embedMilliseconds: ms });
                          }}
                        />
                      </>
                    )}
                  </Card.Content>
                  <Card.Content extra>
                    <Button
                      fluid
                      basic
                      negative
                      onClick={() => {
                        setMedia((old) =>
                          old.filter((item) => different(m, item)),
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </Card.Content>
                </Card>
              );
            })}
          </Card.Group>
        </>
      )}
    </>
  );
};

export default ImageUpload;
