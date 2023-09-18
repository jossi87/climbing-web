import React from "react";
import { Loading } from "./../../common/widgets/widgets";
import { Segment } from "semantic-ui-react";
import { useProfileMedia } from "../../../api";
import Media from "../../common/media/media";
import { useMeta } from "../meta";
import { MetaContext } from "../meta/meta";

type Props = {
  userId: number;
  captured: boolean;
};

const ProfileMedia = ({ userId, captured }: Props) => {
  const { data, isLoading } = useProfileMedia({ userId, captured });
  const meta = useMeta();

  if (isLoading) {
    return <Loading />;
  }

  if (data.length === 0) {
    return <Segment>Empty list.</Segment>;
  }

  return (
    <Segment>
      <MetaContext.Provider
        value={{
          ...meta,
          // Do a little hack to force the image to be read-only in this mode. We
          // should remove this at some point and support a "readonly"-type mode on
          // the Media component itself .. some day.
          // <MetaContext.Provider
          isAdmin: false,
          isSuperAdmin: false,
        }}
      >
        <Media
          numPitches={null}
          media={data}
          orderableMedia={null}
          carouselMedia={data}
          optProblemId={null}
          showLocation={true}
        />
      </MetaContext.Provider>
    </Segment>
  );
};

export default ProfileMedia;
