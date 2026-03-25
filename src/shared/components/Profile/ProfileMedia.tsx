import { Loading } from '../Widgets/Widgets';
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
    return (
      <div className='bg-surface-nav/20 border-surface-border rounded-xl border p-8 text-center text-slate-500 italic'>
        Empty list.
      </div>
    );
  }

  return (
    <div className='bg-surface-card border-surface-border rounded-xl border p-4 sm:p-6'>
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
    </div>
  );
};

export default ProfileMedia;
