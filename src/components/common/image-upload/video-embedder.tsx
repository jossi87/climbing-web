import React, { useState } from 'react';
import { Input } from 'semantic-ui-react';
import fetch from 'isomorphic-fetch';

const VideoEmbedder = ({ addMedia }) => {
  const [embedVideoUrl, setEmbedVideoUrl] = useState(null);
  const [embedThumbnailUrl, setEmbedThumbnailUrl] = useState(null);

  let enabled = (embedVideoUrl && embedThumbnailUrl);

  return (
    <Input
      placeholder='YouTube/Vimeo video URL (supports "start"/"t"-parameter)'
      action={{
        labelPosition: 'right',
        color: enabled? "youtube" : "grey",
        icon: 'youtube',
        content: 'Add',
        disabled: !enabled,
        onClick: () => {
          addMedia(embedVideoUrl, embedThumbnailUrl)
          setEmbedVideoUrl(null);
          setEmbedThumbnailUrl(null);
        }
      }}
      defaultValue={embedVideoUrl}
      onChange={(e) => {
        let videoUrl = e.target.value;
        let thumbnailUrl = null;

        var regExp = /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/;
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
            if (type=='youtu.be' || type=='youtube.com') {
              videoUrl = "https://www.youtube.com/embed/" + id + (start? "?start=" + start : "");
              thumbnailUrl = "https://img.youtube.com/vi/" + id + "/0.jpg";
            }
            else if (type=='vimeo.com') {
              videoUrl = "https://player.vimeo.com/video/" + id + (start? "?t=" + start : "");
              fetch("https://vimeo.com/api/v2/video/" + id + ".json")
              .then((data) => data.json())
              .then((json) => setEmbedThumbnailUrl(json[0].thumbnail_large));
            }
            else {
              console.log(type + " - " + id);
            }
          }
        }

        setEmbedVideoUrl(videoUrl);
        setEmbedThumbnailUrl(thumbnailUrl);
      }}
    />
  );
}
export default VideoEmbedder;