import { Loading } from './../../common/widgets/widgets';
import { useProfileMedia } from '../../../api';
import Media from '../../common/media/media';
import { useMeta } from '../meta';
import { MetaContext } from '../meta/context';

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
      <div className='p-8 text-center text-slate-500 italic bg-surface-nav/20 rounded-xl border border-surface-border'>
        Empty list.
      </div>
    );
  }

  return (
    <div className='bg-surface-card border border-surface-border rounded-xl p-4 sm:p-6'>
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
