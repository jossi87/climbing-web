import React, {Component} from 'react';
import { Redirect } from 'react-router';
let parkingIcon, Map, TileLayer, LayersControl, Marker, Polygon, Tooltip, WMSTileLayer;

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

interface LeafletProps {
  useOpenStreetMap?: boolean,
  defaultZoom: number,
  defaultCenter: Coordinates,
  markers?: Array<Marker>,
  outlines?: Array<Outline>,
  onClick?: Function
}

export default class Leaflet extends Component<LeafletProps, any> {
  componentWillMount() {
    if (__isBrowser__) {
      Map = require('react-leaflet').Map
      TileLayer = require('react-leaflet').TileLayer
      LayersControl = require('react-leaflet').LayersControl
      Marker = require('react-leaflet').Marker
      Polygon = require('react-leaflet').Polygon
      Tooltip = require('react-leaflet').Tooltip
      WMSTileLayer = require('react-leaflet').WMSTileLayer
    }
  }

  updatePosition(url, e) {
    if (url && e) {
      const lat = e.target._latlng.lat;
      const lng = e.target._latlng.lng;
      console.log("UPDATE problem SET latitude=" + lat + ", longitude=" + lng + " WHERE id=" + url.split('/').pop() + ";");
    }
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    if (!Map) {
      return null;
    }
    const opacity = 0.5;
    const markers = this.props.markers && this.props.markers.map((m, i) => {
      if (m.isParking) {
        if (parkingIcon == null) {
          const L = require('leaflet')
          parkingIcon = new L.icon({ iconUrl: '/png/parking_lot_maps.png', iconAnchor: [15, 15] })
        }
        return (
          <Marker position={[m.lat, m.lng]} key={i} onClick={() => {this.setState({pushUrl: m.url})}} icon={parkingIcon}>
            {m.label && (
              <Tooltip opacity={opacity} permanent>
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
            onClick={() => {this.setState({pushUrl: m.url})}}
            draggable={false}
            onDragend={this.updatePosition.bind(this, m.url)}>
            {m.label && (
              <Tooltip opacity={opacity} permanent>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        )
      }
    })
    const polygons = this.props.outlines && this.props.outlines.map((o, i) => (
      <Polygon key={i} positions={o.polygon} onClick={() => {this.setState({pushUrl: o.url})}}>
        {o.label && (
          <Tooltip opacity={opacity} permanent>
            {o.label}
          </Tooltip>
        )}
      </Polygon>
    ))
    const maxZoom = 21;
    return (
      <Map
        center={this.props.defaultCenter}
        zoom={this.props.defaultZoom}
        onClick={this.props.onClick? this.props.onClick.bind(this) : null}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={!this.props.useOpenStreetMap} name="Norge i Bilder">
            <TileLayer
              maxNativeZoom={maxZoom}
              minZoom={0}
              maxZoom={maxZoom}
              attribution='&copy; <a href="https://www.norgeibilder.no/" rel="noopener" target="_blank">Geovekst</a>'
              url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
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

          <LayersControl.BaseLayer checked={this.props.useOpenStreetMap} name="OpenStreetMap">
            <TileLayer
              maxNativeZoom={maxZoom}
              minZoom={0}
              maxZoom={maxZoom}
              attribution='&copy; <a href="http://osm.org/copyright" rel="noopener" target="_blank">OpenStreetMap</a> contributors'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked={!this.props.useOpenStreetMap} name="Stedsnavn">
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

          <LayersControl.Overlay checked={!this.props.useOpenStreetMap} name="Vegnett">
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
      </Map>
    );
  }
}
