import React, { useState } from "react";
import { Input } from "semantic-ui-react";
import fetch from "isomorphic-fetch";

const VideoEmbedder = ({ addMedia }) => {
  const [embedVideoUrl, setEmbedVideoUrl] = useState(null);
  const [embedThumbnailUrl, setEmbedThumbnailUrl] = useState(null);
  const [embedMilliseconds, setEmbedMilliseconds] = useState(0);

  let enabled = embedVideoUrl && embedThumbnailUrl;

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
          addMedia(embedVideoUrl, embedThumbnailUrl, embedMilliseconds);
          setEmbedVideoUrl(null);
          setEmbedThumbnailUrl(null);
          setEmbedMilliseconds(0);
        },
      }}
      defaultValue={embedVideoUrl}
      onChange={(e) => {
        let videoUrl = e.target.value;
        let thumbnailUrl = null;
        let ms = 0;

        var regExp =
          /(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|shorts\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/;
        var match = videoUrl.match(regExp);
        if (match) {
          let type = match[3];
          let id = match[6];
          if (type && id) {
            var urlObj = new URL(videoUrl);
            let start = urlObj.searchParams.get("t");
            if (!start) {
              start = urlObj.searchParams.get("start");
            }
            if (
              !start &&
              videoUrl.includes("vimeo") &&
              videoUrl.includes("#t=")
            ) {
              let ix = videoUrl.lastIndexOf("#t=");
              start = videoUrl.substr(ix + 3);
            }
            if (start) {
              start = start.toUpperCase();
              var total = 0;
              if (/^\d+$/.test(start)) {
                total = parseInt(start);
              } else {
                var hours = start.match(/(\d+)H/);
                var minutes = start.match(/(\d+)M/);
                var seconds = start.match(/(\d+)S/);
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
                .then((json) => setEmbedThumbnailUrl(json[0].thumbnail_large));
            } else {
              console.log(type + " - " + id);
            }
          }
        }

        setEmbedVideoUrl(videoUrl);
        setEmbedThumbnailUrl(thumbnailUrl);
        setEmbedMilliseconds(ms);
      }}
    />
  );
};
export default VideoEmbedder;
