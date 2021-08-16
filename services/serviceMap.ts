import maplibregl from "maplibre-gl";
import { NextRouter } from "next/router";

import { getMultilangValue } from "../utils";
import type { MapPin } from "~/types";

class MapMarkers {
  pins: MapPin[];

  leavingMarkers: Record<string, maplibregl.Marker>;
  incomingMarkers: Record<string, maplibregl.Marker>;

  markers: Record<string, maplibregl.Marker>;

  constructor() {
    this.pins = [];

    this.leavingMarkers = {};
    this.incomingMarkers = {};

    this.markers = {};
  }

  // update(pins: MapPin[]) {
  //   console.log("Update", pins);
  //   console.log("update 1", Object.keys(this.leavingMarkers).length, Object.keys(this.leavingMarkers));
  //   console.log("update 2", Object.keys(this.incomingMarkers).length, Object.keys(this.incomingMarkers));
  //   console.log("update 3", Object.keys(this.markers).length, Object.keys(this.markers));

  //   let hasIncoming = false;
  //   let hasOutgoing = false;

  //   const newPinKeys: string[] = [];
  //   pins.forEach((pin) => {
  //     const key = `${pin.type}${pin.id}`;
  //     newPinKeys.push(key);

  //     console.log(`new key ${key} ${key in this.markers}`);

  //     if (!(key in this.markers)) {
  //       hasIncoming = true;
  // const newPin = new maplibregl.Marker({ color: "#FF0000" }).setLngLat([
  //   pin.lng,
  //   pin.lat,
  // ]);

  //       this.incomingMarkers[key] = newPin;
  //       this.markers[key] = newPin;
  //     }
  //   });

  //   this.leavingMarkers = Object.keys(this.markers).reduce(
  //     (leavingAcc, key) => {
  //       if (newPinKeys.includes(key)) return leavingAcc;

  //       hasOutgoing = true;

  //       const marker = this.markers[key];
  //       delete this.markers[key];
  //       return {
  //         ...leavingAcc,
  //         [key]: marker,
  //       };
  //     },
  //     {} as Record<string, maplibregl.Marker>
  //   );

  //   this.pins = pins;

  //   console.log("update r 1", pins.length, newPinKeys);
  //   console.log("update r 2", Object.keys(this.leavingMarkers).length, Object.keys(this.leavingMarkers));
  //   console.log("update r 3", Object.keys(this.incomingMarkers).length, Object.keys(this.incomingMarkers));
  //   console.log("update r 4", Object.keys(this.markers).length, Object.keys(this.markers));
  //   console.log(hasIncoming, hasOutgoing)

  //   return [hasIncoming, hasOutgoing];
  // }

  // currentPins() {
  //   return this.pins;
  // }

  // incoming() {
  //   return this.incomingMarkers;
  // }

  // leaving() {
  //   return this.leavingMarkers;
  // }

  // clearPins() {
  //   this.pins = [];
  // }

  // clearMarker() {
  //   // TODO: this should actually remove the marker ...
  //   // this.markers = {};
  // }

  // clearLeaving() {
  //   // TODO: this should actually remove the marker ...
  //   this.leavingMarkers = {};
  // }

  // removeMarker(key: string) {
  //   console.log(`removeMarker ${key}`);
  //   if (key in this.markers) delete this.markers[key];
  // }

  // removeMarkerFromIncoming(key: string) {
  //   console.log(`removeMarkerFromIncoming ${key}`);
  //   if (key in this.incomingMarkers) delete this.incomingMarkers[key];
  // }

  // removeMarkerFromLeaving(key: string) {
  //   console.log(`removeMarkerFromLeaving ${key}`);
  //   if (key in this.leavingMarkers) delete this.leavingMarkers[key];
  // }

  add(id: string, pin: maplibregl.Marker) {
    this.markers[id] = pin;
  }

  removeAll() {
    Object.keys(this.markers).forEach((key) => {
      this.markers[key].remove();
      delete this.markers[key];
    });
  }
}

export class CultureMap {
  markers: MapMarkers;

  router: NextRouter | undefined;
  mapRef: maplibregl.Map | undefined;

  constructor() {
    this.mapRef = undefined;
    this.router = undefined;
    this.markers = new MapMarkers();
  }

  init(mapRef: maplibregl.Map | undefined, router: NextRouter) {
    this.mapRef = mapRef;
    this.router = router;
  }

  clear() {
    this.markers.removeAll();
  }

    // https://docs.mapbox.com/help/tutorials/markers-js/
  addMarkers(pins: MapPin[]) {
    if (this.mapRef) {
      console.log("painting pins")
      pins.forEach((pin) => {
        const newPin = new maplibregl.Marker({ color: "#caa328" })
          .setLngLat([pin.lng, pin.lat])
          .addTo(this.mapRef as maplibregl.Map );
          newPin.getElement().addEventListener('click', () => {
            if (this.router) 
              this.router.push(`/${pin.type}/${getMultilangValue(pin.slug)}`)
            
          });
        this.markers.add(`${pin.type}-${pin.id}`, newPin);
      });
    }
  }

  panTo(lng: number, lat: number) {
    if (this.mapRef) {
      this.mapRef.panTo([lng, lat], {
        animate: true,
        duration: 1000,
        essential: true,
        offset: [0,0]
      });
    }
    
  }
}
