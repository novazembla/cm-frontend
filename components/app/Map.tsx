import React, { useRef, useState, useEffect, useContext, useMemo } from "react";

import maplibregl from "maplibre-gl";

import { useMapContext, useConfigContext } from "~/provider";
import { useRouter } from "next/router";


export const Map = () => {

  const router = useRouter();

  const config = useConfigContext();
  const cultureMap = useMapContext();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();
  
  useEffect(() => {
    if (mapRef.current) return; //stops map from intializing more than once

    const map = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${config.mapApiKey}`,
      center: [config.lng, config.lat],
      zoom: config.zoom,
    });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right"); //added

    // map.on('mousemove', function (e) {
    //   var features = map.queryRenderedFeatures(e.point, { layers: ['places'] });
    //   map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    // });

    if (cultureMap)
      cultureMap.init(map, router);
    
    mapRef.current = map;

  });


  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default Map;
