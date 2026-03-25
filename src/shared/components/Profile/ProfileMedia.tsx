import { Loading } from '../../ui/StatusWidgets';
import { useProfileMedia } from '../../../api';
import Media from '../Media/Media';
import { useMeta } from '../Meta';
import { MetaContext } from '../Meta/context';

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

  if (!data || data.length === 0) {
    return <div className='py-10 text-center text-slate-500'>Empty list.</div>;
  }

  return (
    <MetaContext.Provider
      value={{
        ...meta,
        isAdmin: false,
        isSuperAdmin: false,
      }}
    >
      <Media
        pitches={null}
        media={data}
        orderableMedia={null}
        carouselMedia={data}
        optProblemId={null}
        showLocation={true}
      />
    </MetaContext.Provider>
  );
};

export default ProfileMedia;
