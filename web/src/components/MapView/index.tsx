import React, { useState, useEffect } from 'react';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

interface Props {
  getLatLng: (pos: [number, number]) => void;
}

const MapView: React.FC<Props> = ({ getLatLng }) => {
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [clickedPosition, setClickedPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  function handleMapClick(e: LeafletMouseEvent) {
    setClickedPosition([ e.latlng.lat, e.latlng.lng ]);
    getLatLng([ e.latlng.lat, e.latlng.lng ]);
  }
  

  return(
  <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Marker position={clickedPosition} />
  </Map>
  ); 
}

export default MapView;