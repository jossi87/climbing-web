import { type ComponentProps, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../../common/leaflet/leaflet';
import { Loading, LockSymbol } from '../../common/widgets/widgets';
import { useProfileTodo } from '../../../api';
import { MapPin, ChevronRight } from 'lucide-react';

type ProfileTodoProps = {
  userId: number;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
};

const ProfileTodo = ({ userId, defaultCenter, defaultZoom }: ProfileTodoProps) => {
  const { data } = useProfileTodo(userId);

  if (!data) {
    return <Loading />;
  }

  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> = [];
  (data.areas ?? []).forEach((a) => {
    (a.sectors ?? []).forEach((s) => {
      (s.problems ?? []).forEach((p) => {
        if (p.coordinates) {
          markers.push({
            coordinates: p.coordinates,
            label: p.name ?? '',
            url: '/problem/' + p.id,
          });
        }
      });
    });
  });

  if ((data.areas ?? []).length === 0) {
    return (
      <div className='p-8 text-center text-slate-500 italic bg-surface-nav/20 rounded-xl border border-surface-border'>
        Empty list.
      </div>
    );
  }

  return (
    <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm'>
      <div className='border-b border-surface-border'>
        <Leaflet
          key={'todo=' + userId}
          autoZoom={true}
          height='40vh'
          markers={markers}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          showSatelliteImage={false}
          clusterMarkers={true}
          flyToId={null}
        />
      </div>

      <div className='divide-y divide-surface-border'>
        {(data.areas ?? []).map((area) => (
          <div key={area.id} className='p-4 space-y-4'>
            {/* Area Header */}
            <div className='flex items-center gap-2'>
              <MapPin size={16} className='text-brand' />
              <Link
                to={`/area/${area.id}`}
                className='text-sm font-black uppercase tracking-widest text-white hover:text-brand transition-colors'
              >
                {area.name}
              </Link>
              <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
            </div>

            {/* Sectors */}
            <div className='ml-4 space-y-4 border-l-2 border-surface-border pl-4'>
              {(area.sectors ?? []).map((sector) => (
                <div key={sector.id} className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Link
                      to={`/sector/${sector.id}`}
                      className='text-xs font-bold text-slate-300 hover:text-white transition-colors'
                    >
                      {sector.name}
                    </Link>
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </div>

                  {/* Problems */}
                  <div className='ml-2 space-y-1'>
                    {(sector.problems ?? []).map((problem) => (
                      <div
                        key={problem.id}
                        className='flex flex-wrap items-center gap-x-2 py-1 text-sm'
                      >
                        <span className='text-[10px] font-mono text-slate-500 w-6'>
                          #{problem.nr}
                        </span>
                        <Link
                          to={`/problem/${problem.id}`}
                          className='font-medium text-slate-200 hover:text-brand transition-colors'
                        >
                          {problem.name}
                        </Link>
                        <span className='text-xs font-mono text-slate-400'>[{problem.grade}]</span>

                        <LockSymbol
                          lockedAdmin={problem.lockedAdmin}
                          lockedSuperadmin={problem.lockedSuperadmin}
                        />

                        {problem.partners && problem.partners.length > 0 && (
                          <div className='text-[11px] text-slate-500 italic flex items-center gap-1'>
                            <ChevronRight size={10} className='opacity-30' />
                            <span>Other users:</span>
                            <div className='flex gap-1'>
                              {problem.partners.map((u, i) => (
                                <Fragment key={u.id}>
                                  <Link
                                    to={`/user/${u.id}/todo`}
                                    className='text-slate-400 hover:text-brand transition-colors not-italic'
                                  >
                                    {u.name}
                                  </Link>
                                  {i < (problem.partners?.length ?? 0) - 1 && (
                                    <span className='not-italic opacity-30'>,</span>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileTodo;
