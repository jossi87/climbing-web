import React, { useState } from "react";
import { Input } from "semantic-ui-react";

type Info = {
  embedVideoUrl: string | undefined;
  embedThumbnailUrl: string | undefined;
  embedMilliseconds: number;
};

type Props = {
  addMedia: (_: Info) => void;
};

const INIT: Info = {
  embedVideoUrl: undefined,
  embedThumbnailUrl: undefined,
  embedMilliseconds: 0,
};

const VideoEmbedder = ({ addMedia }: Props) => {
  const [{ embedVideoUrl, embedThumbnailUrl, embedMilliseconds }, setInfo] =
    useState<Info>(INIT);

  const enabled = embedVideoUrl && embedThumbnailUrl;

  return (
    <Input
      placeholder='YouTube/Vimeo video URL (supports "start"/"t"-parameter)'
      action={{
        labelPosition: "right",
        color: enabled ? "youtube" : "grey",
        icon: "youtube",
        content: "Add",
        disabled: !enabled,
        onClick: () => {
          addMedia({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds });
          setInfo(INIT);
        },
      }}
      defaultValue={embedVideoUrl}
      onChange={(e) => {
        let videoUrl = e.target.value;
        let thumbnailUrl: string | undefined = undefined;
        let ms = 0;

        const regExp =
          /(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|shorts\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(&\S+)?/;
        const match = videoUrl.match(regExp);
        if (match) {
          const type = match[3];
          const id = match[6];
          if (type && id) {
            const urlObj = new URL(videoUrl);
            let start = urlObj.searchParams.get("t");
            if (!start) {
              start = urlObj.searchParams.get("start");
            }
            if (
              !start &&
              videoUrl.includes("vimeo") &&
              videoUrl.includes("#t=")
            ) {
              const ix = videoUrl.lastIndexOf("#t=");
              start = videoUrl.substring(ix + 3);
            }
            if (start) {
              start = start.toUpperCase();
              let total = 0;
              if (/^\d+$/.test(start)) {
                total = parseInt(start);
              } else {
                const hours = start.match(/(\d+)H/);
                const minutes = start.match(/(\d+)M/);
                const seconds = start.match(/(\d+)S/);
                if (hours) total += parseInt(hours[1]) * 3600;
                if (minutes) total += parseInt(minutes[1]) * 60;
                if (seconds) total += parseInt(seconds[1]);
              }
              if (total > 0) {
                ms = total * 1000;
              }
            }
            if (type == "youtu.be" || type == "youtube.com") {
              videoUrl = "https://www.youtube.com/embed/" + id;
              thumbnailUrl = "https://img.youtube.com/vi/" + id + "/0.jpg";
            } else if (type == "vimeo.com") {
              videoUrl = "https://player.vimeo.com/video/" + id;
              fetch("https://vimeo.com/api/v2/video/" + id + ".json")
                .then((data) => data.json())
                .then((json) =>
                  setInfo((old) => ({
                    ...old,
                    embedThumbnailUrl: json[0].thumbnail_large,
                  })),
                );
            } else {
              console.log(type + " - " + id);
            }
          }

          setInfo({
            embedVideoUrl: videoUrl,
            embedThumbnailUrl: thumbnailUrl,
            embedMilliseconds: ms,
          });
        }
      }}
    />
  );
};
export default VideoEmbedder;
