import React, { useRef, useState, useEffect, useContext, useMemo } from "react";
import { Box } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";

import { useMapPinsContext, useConfigContext } from "~/provider";
import type { MapPin } from "~/types";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};


class MapMarkers {
  pins: MapPin[];

  leavingMarkers: Record<string, maplibregl.Marker>;
  incomingMarkers: Record<string, maplibregl.Marker>;

  markers: Record<string, maplibregl.Marker>;

  constructor() {
    console.log("MapMarkers");
    this.pins = [];

    this.leavingMarkers = {};
    this.incomingMarkers = {};

    this.markers = {};
  }

  update(pins: MapPin[]) {
    console.log("Update", pins);
    console.log("update 1", Object.keys(this.leavingMarkers).length, Object.keys(this.leavingMarkers));
    console.log("update 2", Object.keys(this.incomingMarkers).length, Object.keys(this.incomingMarkers));
    console.log("update 3", Object.keys(this.markers).length, Object.keys(this.markers));

    
    let hasIncoming = false;
    let hasOutgoing = false;

    const newPinKeys: string[] = [];
    pins.forEach((pin) => {
      const key = `${pin.type}${pin.id}`;
      newPinKeys.push(key);

      console.log(`new key ${key} ${key in this.markers}`);

      if (!(key in this.markers)) {
        hasIncoming = true;
        const newPin = new maplibregl.Marker({ color: "#FF0000" }).setLngLat([
          pin.lng,
          pin.lat,
        ]);

        this.incomingMarkers[key] = newPin;
        this.markers[key] = newPin;
      }
    });

    this.leavingMarkers = Object.keys(this.markers).reduce(
      (leavingAcc, key) => {
        if (newPinKeys.includes(key)) return leavingAcc;

        hasOutgoing = true;

        const marker = this.markers[key];
        delete this.markers[key];
        return {
          ...leavingAcc,
          [key]: marker,
        };
      },
      {} as Record<string, maplibregl.Marker>
    );

    this.pins = pins;

    console.log("update r 1", pins.length, newPinKeys);
    console.log("update r 2", Object.keys(this.leavingMarkers).length, Object.keys(this.leavingMarkers));
    console.log("update r 3", Object.keys(this.incomingMarkers).length, Object.keys(this.incomingMarkers));
    console.log("update r 4", Object.keys(this.markers).length, Object.keys(this.markers));
    console.log(hasIncoming, hasOutgoing)
    
    return [hasIncoming, hasOutgoing];
  }

  currentPins() {
    return this.pins;
  }

  incoming() {
    return this.incomingMarkers;
  }

  leaving() {
    return this.leavingMarkers;
  }

  clearPins() {
    this.pins = [];
  }

  clearMarker() {
    // TODO: this should actually remove the marker ...
    // this.markers = {};
  }

  clearLeaving() {
    // TODO: this should actually remove the marker ...
    this.leavingMarkers = {};
  }

  removeMarker(key: string) {
    console.log(`removeMarker ${key}`);
    if (key in this.markers) delete this.markers[key];
  }

  removeMarkerFromIncoming(key: string) {
    console.log(`removeMarkerFromIncoming ${key}`);
    if (key in this.incomingMarkers) delete this.incomingMarkers[key];
  }

  removeMarkerFromLeaving(key: string) {
    console.log(`removeMarkerFromLeaving ${key}`);
    if (key in this.leavingMarkers) delete this.leavingMarkers[key];
  }
}

export const Map = () => {
  const [currentPins, setCurrentPins] = useState<maplibregl.Marker[]>([]);
  const config = useConfigContext();
  const mapPinsInContext = useMapPinsContext();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map>();
  const mapMarkers = useRef<MapMarkers>();

  const [lng] = useState(config.lng);
  const [lat] = useState(config.lat);
  const [zoom] = useState(config.zoom);

  useEffect(() => {
    if (map.current) return; //stops map from intializing more than once
    if (mapMarkers.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${config.mapApiKey}`,
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right"); //added

    mapMarkers.current = new MapMarkers();
  });

  const [updateLeaving, updateNew] = useMemo(
    () => {
      console.log("running memo");
      return mapMarkers.current ? mapMarkers.current.update(mapPinsInContext) : [false, false];
    },
      
    [mapPinsInContext]
  );
    console.log("Memo: ", updateLeaving, updateNew);

  // useEffect(() => {
  //   if (mapMarkers.current && updateLeaving) {
  //     const leavingMarkers = mapMarkers.current.leaving();

  //     Object.keys(leavingMarkers).forEach((key) => {
  //       const marker = leavingMarkers[key];
  //       setTimeout(() => {
  //         marker.remove();
  //         mapMarkers.current?.removeMarkerFromLeaving(key);
  //       }, randomIntFromInterval(100, 1000));
  //     });
  //   }
  // }, [updateLeaving, mapMarkers]);

  useEffect(() => {
    console.log("incoming", updateNew);
    if (mapMarkers.current && updateNew) {
      
      const incomingMarkers = mapMarkers.current.incoming();

      console.log("incoming markers", incomingMarkers);

      Object.keys(incomingMarkers).forEach((key) => {
        const marker = incomingMarkers[key];
        // mapMarkers.current?.removeMarkerFromIncoming(key);
        setTimeout(() => {
          marker.addTo(map.current as maplibregl.Map);
        }, randomIntFromInterval(100, 1000));
      });
    }
  }, [updateNew, mapMarkers, map]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default Map;
