import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Card, Image, Input, Checkbox } from "semantic-ui-react";
import VideoEmbedder from "./video-embedder";
import UserSelector from "../user-selector/user-selector";

const ImageUpload = ({
  onMediaChanged,
  isMultiPitch,
  includeVideoEmbedder,
}) => {
  const [media, setMedia] = useState([]);
  const onDrop = useCallback(
    (acceptedFiles) => {
      const allMedia = media;
      acceptedFiles.forEach((f) => {
        f.preview = URL.createObjectURL(f);
        f.trivia = false;
        allMedia.push({ file: f });
      });
      setMedia(allMedia);
      onMediaChanged(allMedia);
    },
    [media, onMediaChanged],
  );
  const accept = { "image/jpeg": [".jpeg", ".png"] };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
  });

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
      {includeVideoEmbedder && (
        <>
          <br />
          <VideoEmbedder
            addMedia={(embedVideoUrl, embedThumbnailUrl, embedMilliseconds) => {
              const allMedia = media;
              allMedia.push({
                embedVideoUrl,
                embedThumbnailUrl,
                embedMilliseconds,
              });
              setMedia(allMedia);
              onMediaChanged(allMedia);
            }}
          />
        </>
      )}
      {media.length > 0 && (
        <>
          <br />
          <br />
          <Card.Group itemsPerRow={4} stackable>
            {media.map((m, i) => {
              let min = 0;
              let sec = 0;
              if (
                m.embedThumbnailUrl &&
                m.embedMilliseconds &&
                m.embedMilliseconds > 0
              ) {
                (min = Math.floor((m.embedMilliseconds / 1000 / 60) << 0)),
                  (sec = Math.floor((m.embedMilliseconds / 1000) % 60));
              }
              return (
                <Card key={i}>
                  <Image src={m.file ? m.file.preview : m.embedThumbnailUrl} />
                  <Card.Content>
                    {isMultiPitch && (
                      <Input
                        size="mini"
                        icon="hashtag"
                        iconPosition="left"
                        fluid
                        placeholder="Pitch"
                        value={m.pitch}
                        onChange={(e, { value }) => {
                          m.pitch = parseInt(value);
                          onMediaChanged(media);
                        }}
                      />
                    )}
                    <Input
                      size="mini"
                      icon="comment"
                      iconPosition="left"
                      fluid
                      placeholder="Description"
                      value={m.description}
                      onChange={(e, { value }) => {
                        m.description = value;
                        onMediaChanged(media);
                      }}
                    />
                    <Checkbox
                      label="Trivia"
                      toggle
                      checked={m.trivia}
                      onChange={() => {
                        m.trivia = !m.trivia;
                        m.pitch = null;
                        onMediaChanged(media);
                      }}
                    />
                    <UserSelector
                      users={[]}
                      isMulti={false}
                      placeholder="In photo/video"
                      onUsersUpdated={(u, m) => {
                        m.inPhoto = u.label;
                        onMediaChanged(media);
                      }}
                      identity={m}
                    />
                    <UserSelector
                      users={[]}
                      isMulti={false}
                      placeholder="Photographer"
                      onUsersUpdated={(u, m) => {
                        m.photographer = u.label;
                        onMediaChanged(media);
                      }}
                      identity={m}
                    />
                    {m.embedThumbnailUrl && (
                      <>
                        <label>Start video at:</label>
                        <Input
                          size="mini"
                          label="Min"
                          value={min}
                          onChange={(e, { value }) => {
                            const val = parseInt(value);
                            const ms = (val * 60 + sec) * 1000;
                            m.embedMilliseconds = ms;
                            onMediaChanged(media);
                          }}
                        />
                        <Input
                          size="mini"
                          label="Sec"
                          value={sec}
                          onChange={(e, { value }) => {
                            const val = parseInt(value);
                            const ms = (min * 60 + val) * 1000;
                            m.embedMilliseconds = ms;
                            onMediaChanged(media);
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
                        const allMedia = media.filter((m2) => m != m2);
                        setMedia(allMedia);
                        onMediaChanged(allMedia);
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
