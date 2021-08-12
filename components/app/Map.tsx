import React, { useRef, useState, useEffect, useContext, useMemo } from 'react'
import { Box } from '@chakra-ui/react';
import maplibregl from 'maplibre-gl';
import { useConfig } from '~/hooks';
import { MapContext } from "~/provider";

export const Map = () => {
  const [currentPins, setCurrentPins] = useState<maplibregl.Marker[]>([])
  const config = useConfig();
  const { pins } = useContext(MapContext);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map>();

  const [lng] = useState(config.lng);
  const [lat] = useState(config.lat);
  const [zoom] = useState(config.zoom);

  const newPins = useMemo(() => pins, [pins])
  console.log("p", pins);
  // map marker.
  console.log(pins);
  useEffect(() => {
    if (map.current) return; //stops map from intializing more than once
    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${config.mapApiKey}`,
      center: [lng, lat],
      zoom: zoom
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-left'); //added
  });
  console.log("NP", newPins);
  useEffect(() => {
    // currentPins.forEach((pin: any) => pin.remove())
    console.log("UENP", newPins);
    if (map.current)
      setCurrentPins(newPins.map((pin) => {
      
        const el = new maplibregl.Marker({color: "#FF0000"}) //added
        .setLngLat([pin.lng, pin.lat]).addTo(map.current as maplibregl.Map);
      
      return el;
    }))
    
  }, [newPins])

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  )
}

export default Map;
