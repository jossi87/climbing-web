import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Leaflet from './components/common/leaflet/leaflet';

interface LeafletPrintProps {
  json: string;
}
const LeafletPrint = () => {
  let { json } = useParams<LeafletPrintProps>();
  let leaflet = JSON.parse(json);
  const outlines = leaflet.outlines.map(o => {
    const polygon = o.polygonCoords.split(";").map((c, i) => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    return {label: o.name, polygon}
  });
  const polylines = leaflet.polylines.map(p => {
    return {
      label: p.name,
      polyline: p.polyline.split(";").map(e => {
        return e.split(",").map(Number);
      })
    }
  });
  return (
    <Leaflet height={'100vh'} markers={leaflet.markers} outlines={outlines} polylines={polylines} defaultCenter={leaflet.defaultCenter} defaultZoom={leaflet.defaultZoom} history={null} onClick={null} onlyMap={true} />
  );
}

export default LeafletPrint;