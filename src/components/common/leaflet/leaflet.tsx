import React, {Component} from 'react';
let parkingIcon, Circle, Map, TileLayer, LayersControl, Marker, Polygon, Polyline, Tooltip, WMSTileLayer;

interface Coordinates {
  lat: number,
  lng: number
}

interface Marker {
  lat: number,
  lng: number,
  url?: string,
  label?: string,
  isParking?: boolean,
}

interface Outline {
  polygon: Array<Number>,
  url?: string,
  label?: string
}

interface Polyline {
  polyline: Array<Array<number>>,
  label: string
}

interface LeafletProps {
  height?: string,
  defaultZoom: number,
  defaultCenter: Coordinates,
  markers?: Array<Marker>,
  outlines?: Array<Outline>,
  polylines?: Array<Polyline>,
  onClick?: Function,
  history: any
}
class Leaflet extends Component<LeafletProps> {
  componentDidMount() {
    Map = require('react-leaflet').Map
    Circle = require('react-leaflet').Circle
    TileLayer = require('react-leaflet').TileLayer
    LayersControl = require('react-leaflet').LayersControl
    Marker = require('react-leaflet').Marker
    Polygon = require('react-leaflet').Polygon
    Polyline = require('react-leaflet').Polyline
    Tooltip = require('react-leaflet').Tooltip
    WMSTileLayer = require('react-leaflet').WMSTileLayer
    this.setState({render: true});
  }

  updatePosition = (url, e) => {
    if (url && e) {
      const lat = e.target._latlng.lat;
      const lng = e.target._latlng.lng;
      console.log("UPDATE problem SET latitude=" + lat + ", longitude=" + lng + " WHERE id=" + url.split('/').pop() + ";");
    }
  }

  calculateDistance(polyline) {
    var km = 0;
    for (var i = 1; i < polyline.length; i++) {
      const lat1 = polyline[i-1][0];
      const lng1 = polyline[i-1][1];
      const lat2 = polyline[i][0];
      const lng2 = polyline[i][1];
      km += this.calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2);
    }
    if (km > 1) {
      return Math.round(km*100)/100 + " km";
    }
		return Math.round(km*1000) + " meter";
  }

  calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the earth in km
		const dLat = this.deg2rad(lat2-lat1);  // deg2rad below
		const dLon = this.deg2rad(lng2-lng1); 
		const a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2)
				; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
		return deg * (Math.PI/180);
	}

  render() {
    if (!Map) {
      return null;
    }
    const markers = this.props.markers && this.props.markers.map((m, i) => {
      if (m.isParking) {
        if (parkingIcon == null) {
          const L = require('leaflet')
          parkingIcon = new L.icon({ iconUrl: '/png/parking_lot_maps.png', iconAnchor: [15, 15] })
        }
        return (
          <Marker position={[m.lat, m.lng]} key={i} onClick={() => this.props.onClick? null : this.props.history.push(m.url)} icon={parkingIcon}>
            {m.label && (
              <Tooltip opacity={0.5} permanent>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        )
      } else {
        return (
          <Marker
            position={[m.lat, m.lng]}
            key={i}
            onClick={() => this.props.history.push(m.url)}
            draggable={false}
            onDragend={() => this.updatePosition(m.url, this)}>
            {m.label && (
              <Tooltip opacity={0.5} permanent>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        )
      }
    })

    const polygons = this.props.outlines && this.props.outlines.map((o, i) => (
      <Polygon key={i} positions={o.polygon} onClick={() => this.props.onClick? null : this.props.history.push(o.url)}>
        {o.label && (
          <Tooltip opacity={0.9} permanent>
            {o.label}
          </Tooltip>
        )}
      </Polygon>
    ))
    var polylines;
    if (this.props.polylines) {
      polylines = this.props.polylines.map((p, i) => {
        if (p.polyline.length == 1) {
          return <Circle key={i} center={p.polyline[0]} radius={0.5} />
        }
        else {
          const distance = this.calculateDistance(p.polyline);
          return (
          <Polyline key={i} color="lime" positions={p.polyline}>
            <Tooltip opacity={0.5} permanent>
              {this.props.polylines.length>1 && p.label + ": "}{distance}
            </Tooltip>
          </Polyline>);
        }
      })
    }
    const maxZoom = 21;
    const height = this.props.height? this.props.height : '500px';
    return (
      <Map
        style={{height: height, width: '100%', zIndex: 0}}
        center={this.props.defaultCenter}
        zoom={this.props.defaultZoom}
        onClick={this.props.onClick? this.props.onClick : null}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={true} name="Norge i Bilder">
            <TileLayer
              maxNativeZoom={maxZoom}
              minZoom={0}
              maxZoom={maxZoom}
              attribution='&copy; <a href="https://www.norgeibilder.no/" rel="noopener" target="_blank">Geovekst</a>'
              url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              maxNativeZoom={maxZoom}
              minZoom={0}
              maxZoom={maxZoom}
              attribution='&copy; <a href="https://osm.org/copyright" rel="noopener" target="_blank">OpenStreetMap</a> contributors'
              url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Kartverket N50 topo">
            <TileLayer
              maxNativeZoom={15}
              minZoom={0}
              maxZoom={15}
              subdomains='23'
              attribution='&copy; <a href="https://wiki.openstreetmap.org/wiki/No:Kartverket_import" rel="noopener" target="_blank">Kartverket</a>'
              url='https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked={true} name="Stedsnavn">
            <WMSTileLayer
                maxNativeZoom={maxZoom}
                minZoom={0}
                maxZoom={maxZoom}
                transparent={true}
                format={"image/png"}
                layers={"Stedsnavn"}
                version={"1.3.0"}
                uppercase={true}
                url="https://openwms.statkart.no/skwms1/wms.topo4"
              />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={true} name="Vegnett">
            <WMSTileLayer
                maxNativeZoom={maxZoom}
                minZoom={0}
                maxZoom={maxZoom}
                transparent={true}
                format={"image/png"}
                layers={"all"}
                version={"1.3.0"}
                uppercase={true}
                url="https://openwms.statkart.no/skwms1/wms.vegnett"
              />
          </LayersControl.Overlay>

        </LayersControl>
        {markers}
        {polygons}
        {polylines}
      </Map>
    );
  }
}

export default Leaflet;