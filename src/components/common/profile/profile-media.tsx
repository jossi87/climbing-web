import React from "react";
import { Loading } from "./../../common/widgets/widgets";
import { Segment } from "semantic-ui-react";
import { useProfileMedia } from "../../../api";
import Media from "../../common/media/media";

type Props = {
  userId: number;
  isBouldering: boolean;
  captured: boolean;
};

const ProfileMedia = ({ userId, isBouldering, captured }: Props) => {
  const { data, isLoading } = useProfileMedia({ userId, captured });

  if (isLoading) {
    return <Loading />;
  }

  if (data.length === 0) {
    return <Segment>Empty list.</Segment>;
  }

  return (
    <Segment>
      <Media
        numPitches={null}
        isAdmin={false}
        media={data}
        optProblemId={null}
        isBouldering={isBouldering}
      />
    </Segment>
  );
};

export default ProfileMedia;
