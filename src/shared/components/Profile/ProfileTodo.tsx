import { type ComponentProps, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol } from '../../ui/Indicators';
import { useProfileTodo } from '../../../api';
import { MapPin, ChevronRight } from 'lucide-react';
import { Loading } from '../../ui/StatusWidgets';

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
    return <div className='py-10 text-center text-slate-500'>Empty list.</div>;
  }

  return (
    <div className='overflow-hidden'>
      <div className='border-surface-border border-b'>
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

      <div className='divide-surface-border divide-y'>
        {(data.areas ?? []).map((area) => (
          <div key={area.id} className='space-y-4 p-4'>
            {/* Area Header */}
            <div className='flex items-center gap-2'>
              <MapPin size={16} className='text-brand' />
              <Link to={`/area/${area.id}`} className='type-label hover:text-brand transition-colors'>
                {area.name}
              </Link>
              <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
            </div>

            {/* Sectors */}
            <div className='border-surface-border ml-4 space-y-4 border-l-2 pl-4'>
              {(area.sectors ?? []).map((sector) => (
                <div key={sector.id} className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Link
                      to={`/sector/${sector.id}`}
                      className='type-small font-semibold opacity-85 transition-colors hover:opacity-100'
                    >
                      {sector.name}
                    </Link>
                    <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                  </div>

                  {/* Problems */}
                  <div className='ml-2 space-y-1'>
                    {(sector.problems ?? []).map((problem) => (
                      <div key={problem.id} className='flex flex-wrap items-center gap-x-2 py-1 text-sm'>
                        <span className='w-6 font-mono text-[10px] text-slate-500'>#{problem.nr}</span>
                        <Link
                          to={`/problem/${problem.id}`}
                          className='type-body hover:text-brand font-medium transition-colors'
                        >
                          {problem.name}
                        </Link>
                        <span className='font-mono text-xs text-slate-400'>[{problem.grade}]</span>

                        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />

                        {problem.partners && problem.partners.length > 0 && (
                          <div className='flex items-center gap-1 text-[11px] text-slate-500 italic'>
                            <ChevronRight size={10} className='opacity-30' />
                            <span>Other users:</span>
                            <div className='flex gap-1'>
                              {problem.partners.map((u, i) => (
                                <Fragment key={u.id}>
                                  <Link
                                    to={`/user/${u.id}/todo`}
                                    className='hover:text-brand text-slate-400 not-italic transition-colors'
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
