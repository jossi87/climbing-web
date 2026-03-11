import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import type { components } from '../../../@types/buldreinfo/swagger';
import { Segment, Header, Icon, Image, Popup, Label, Button, LabelDetail } from 'semantic-ui-react';
import { type TWeatherSymbolKey, weatherSymbolKeys } from '../../../yr';
import { SunOnWall } from './SunOnWall';
import { SunriseSunset } from './SunriseSunset';

type LockSymbolProps = {
  lockedAdmin?: boolean;
  lockedSuperadmin?: boolean;
};

export function LockSymbol({ lockedAdmin = false, lockedSuperadmin = false }: LockSymbolProps) {
  if (lockedSuperadmin) {
    return <Icon color='black' name='user secret' aria-label='Locked (Superadmin access only)' />;
  } else if (lockedAdmin) {
    return <Icon color='black' name='lock' aria-label='Locked (Admin access only)' />;
  }
  return null;
}

type StarsProps = {
  numStars?: number;
  includeStarOutlines?: boolean;
};

export function Stars({ numStars = -1, includeStarOutlines = false }: StarsProps) {
  if (numStars === -1) {
    return null;
  }

  const fullStars = Math.floor(numStars);
  const hasHalfStar = numStars % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 3; i++) {
    if (i < fullStars) {
      stars.push(<Icon key={i} color='black' name='star' aria-label='Full star' />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Icon key={i} color='black' name='star half' aria-label='Half star' />);
    } else if (includeStarOutlines) {
      stars.push(
        <Icon
          key={i}
          color='black'
          name='star outline'
          style={{ opacity: 0.5 }}
          aria-label='Empty star'
        />,
      );
    }
  }

  if (stars.length === 0) {
    return null;
  }

  return (
    <div
      style={{ whiteSpace: 'nowrap', display: 'inline-flex' }}
      aria-label={`Rating: ${numStars} out of 3 stars`}
    >
      {stars}
    </div>
  );
}

export function Loading() {
  return (
    <div
      style={{
        padding: '2em',
        textAlign: 'center',
        background: 'white',
        borderRadius: '5px',
        border: '1px solid #eee',
      }}
    >
      <div className='pure-css-spinner'></div>
      <h3 style={{ margin: '1em 0 0.5em', fontFamily: 'sans-serif' }}>Just one second</h3>
      <p style={{ color: '#666' }}>We are fetching that content for you.</p>

      <style>{`
        .pure-css-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border: 4px solid rgba(0,0,0,0.1);
          border-left-color: black;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function NotLoggedIn() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Segment>
      <Header as='h3'>
        <Icon name='lock' />
        <Header.Content>
          Authentication required
          <Header.Subheader>You must be logged in to access this page</Header.Subheader>
        </Header.Content>
      </Header>
      <Button
        primary
        icon
        labelPosition='left'
        onClick={() => {
          loginWithRedirect({ appState: { returnTo: location.pathname } });
        }}
      >
        <Icon name='sign in' />
        Sign in
      </Button>
    </Segment>
  );
}

export function InsufficientPrivileges() {
  return (
    <Segment>
      <Header as='h3'>
        <Icon name='warning sign' />
        <Header.Content>
          Insufficient privileges
          <Header.Subheader>You don&apos;t have access to this page</Header.Subheader>
        </Header.Content>
      </Header>
      Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want access.
    </Segment>
  );
}
type ConditionLabelsProps = {
  lat: number;
  lng: number;
  label: string;
  wallDirectionCalculated: components['schemas']['CompassDirection'] | undefined;
  wallDirectionManual: components['schemas']['CompassDirection'] | undefined;
  sunFromHour: number;
  sunToHour: number;
};

export { SunOnWall };

export const WallDirection = ({
  wallDirectionCalculated,
  wallDirectionManual,
}: Pick<ConditionLabelsProps, 'wallDirectionCalculated' | 'wallDirectionManual'>) => {
  if (wallDirectionCalculated?.direction || wallDirectionManual?.direction) {
    return (
      <Popup
        size='tiny'
        content={
          wallDirectionManual
            ? 'Wall direction (manually set)'
            : 'Wall direction (calculated from outline)'
        }
        trigger={
          <Label basic size='mini'>
            <Icon name='compass outline' />
            {wallDirectionManual?.direction ?? wallDirectionCalculated?.direction}
          </Label>
        }
      />
    );
  }
  return null;
};

type YrData = {
  properties: {
    timeseries: {
      time: string;
      data: {
        next_1_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
        next_6_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
        next_12_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
      };
    }[];
  };
};

export const WeatherIcon = ({ symbol }: { symbol: undefined | 'loading' | TWeatherSymbolKey }) => {
  if (symbol === 'loading') {
    return <Icon name='spinner' loading aria-label='Loading weather...' />;
  }

  if (symbol && weatherSymbolKeys[symbol]) {
    return (
      <img
        alt={symbol.replace(/_/g, ' ')}
        src={`/svg/yr/${weatherSymbolKeys[symbol]}.svg`}
        width={20}
        height={20}
        loading='lazy'
      />
    );
  }

  return <Icon name='rain' aria-label='Weather unknown' />;
};

const YrLink = ({ lat, lng }: Pick<ConditionLabelsProps, 'lat' | 'lng'>) => {
  const { data: weatherData, isLoading } = useQuery({
    queryKey: [`yr/weather`, { lat, lng }],
    enabled: !!lat && !!lng,
    queryFn: () =>
      fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
      ).then((res) => res.json() as Promise<YrData>),
    select: (data) => data.properties?.timeseries?.[0]?.data,
  });

  const next1Hours = weatherData?.next_1_hours?.summary?.symbol_code;
  const next6Hours = weatherData?.next_6_hours?.summary?.symbol_code;
  const next12Hours = weatherData?.next_12_hours?.summary?.symbol_code;

  const label = (
    <Label
      href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
      rel='noopener noreferrer'
      target='_blank'
      image
      basic
      size='mini'
      aria-label='Weather forecast from Yr.no'
      onClick={(e) => {
        if (matchMedia && !matchMedia('(hover:hover)')?.matches) {
          // If the device doesn't have the ability to hover, don't take them
          // to yr.no immediately.
          e.preventDefault();
        }
      }}
    >
      <WeatherIcon symbol={isLoading ? 'loading' : next1Hours} />
      Yr.no
    </Label>
  );

  if (isLoading || !weatherData || !next1Hours || !next6Hours || !next12Hours) {
    return label;
  }

  return (
    <Popup trigger={label} size='tiny'>
      <table aria-label='Weather forecast details'>
        <tbody>
          <tr>
            <td>
              <img
                width={50}
                height={50}
                alt={next1Hours?.replace(/_/g, ' ')}
                src={`/svg/yr/${weatherSymbolKeys[next1Hours]}.svg`}
                loading='lazy'
              />
            </td>
            <td>
              <img
                width={50}
                height={50}
                alt={next6Hours?.replace(/_/g, ' ')}
                src={`/svg/yr/${weatherSymbolKeys[next6Hours]}.svg`}
                loading='lazy'
              />
            </td>
            <td>
              <img
                width={50}
                height={50}
                alt={next12Hours?.replace(/_/g, ' ')}
                src={`/svg/yr/${weatherSymbolKeys[next12Hours]}.svg`}
                loading='lazy'
              />
            </td>
          </tr>
          <tr>
            <th style={{ textAlign: 'center', fontWeight: 'normal' }}>1 hr</th>
            <th style={{ textAlign: 'center', fontWeight: 'normal' }}>6 hrs</th>
            <th style={{ textAlign: 'center', fontWeight: 'normal' }}>12 hrs</th>
          </tr>
          <tr>
            <td colSpan={3} style={{ textAlign: 'center' }}>
              Provided by{' '}
              <a
                href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
                rel='noopener noreferrer'
                target='_blank'
              >
                yr.no
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </Popup>
  );
};

export function ConditionLabels({
  lat,
  lng,
  label,
  wallDirectionCalculated,
  wallDirectionManual,
  sunFromHour,
  sunToHour,
}: ConditionLabelsProps) {
  if (!lat || !lng) {
    return null;
  }

  const d = new Date();
  const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  return (
    <>
      <WallDirection
        wallDirectionCalculated={wallDirectionCalculated}
        wallDirectionManual={wallDirectionManual}
      />
      <SunOnWall sunFromHour={sunFromHour} sunToHour={sunToHour} />
      <SunriseSunset lat={lat} lng={lng} />
      <YrLink lat={lat} lng={lng} />
      <Label
        href={`/webcams/` + JSON.stringify({ lat, lng, label })}
        rel='noopener'
        target='_blank'
        basic
        size='mini'
        aria-label='View webcams for this location'
      >
        <Icon name='camera' />
        Webcams
      </Label>
      <Label
        href={`https://www.suncalc.org/#/${lat},${lng},17/${date}/${time}/1/0`}
        rel='noopener'
        target='_blank'
        basic
        size='mini'
        aria-label='View sun position on SunCalc'
      >
        <Icon name='external alternate' />
        SunCalc
        <LabelDetail>
          {date}-{time}
        </LabelDetail>
      </Label>
    </>
  );
}

export function ExternalLinkLabels({
  externalLinks,
}: {
  externalLinks?: components['schemas']['ExternalLink'][] | null;
}) {
  if (!externalLinks || externalLinks.length === 0) {
    return null;
  }
  return externalLinks.map((l) => {
    const url = l.url ?? '';
    const ixOfPage = url.indexOf('page=');
    return (
      <Label basic key={l.id} href={url} rel='noopener' target='_blank' size='mini'>
        <Icon name='linkify' />
        {l.title}
        {ixOfPage !== -1 && <LabelDetail>Page {url.substring(ixOfPage + 5)}</LabelDetail>}
      </Label>
    );
  });
}

export function NoDogsAllowed() {
  return (
    <Header as='h5' color='red' image>
      <Image
        src='/svg/no-animals.svg'
        alt='No dogs allowed'
        rounded
        size='mini'
        width={35}
        height={35}
        loading='lazy'
      />
      <Header.Content>
        No dogs allowed
        <Header.Subheader>The landowner asks us not to bring dogs to this crag.</Header.Subheader>
      </Header.Content>
    </Header>
  );
}
