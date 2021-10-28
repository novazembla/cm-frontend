import maplibregl from "maplibre-gl";
import { NextRouter } from "next/router";

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

type MapHighlight = {
  id: number;
  lng: number;
  lat: number;
  color: string;
};

export class CultureMap {
  markers: MapMarkers;

  highlight: MapHighlight | null;

  router: NextRouter | null;
  mapRef: maplibregl.Map | null;
  loaded: boolean;

  locationId: number | null;

  constructor() {
    this.highlight = null;
    this.mapRef = null;
    this.router = null;
    this.locationId = null;
    this.markers = new MapMarkers();
    this.loaded = false;
  }

  init(mapRef: maplibregl.Map | null, router: NextRouter) {
    this.mapRef = mapRef;
    this.router = router;

    if (this.mapRef) {
      this.mapRef.once("load", () => {
        console.log("trigger loaded");
        this.loaded = true;
      });
    }
  }

  clear() {
    this.markers.removeAll();
  }

  setHighlight(highlight: MapHighlight) {

    console.log(highlight)
    this.highlight = highlight;

    if (this.mapRef) {
      const run = () => {
        const data = {
          features: [
            {
              type: "Feature",
              geometry: {
                coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `loc-${highlight.id}`,
                color: "#fff",
                strokeColor: highlight.color,
                radius: 20,
                strokeWidth: 2,
              },
            },
            {
              type: "Feature",
              geometry: {
                coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
                type: "Point",
              },
              properties: {
                id: `loc-${highlight.id}`,
                color: highlight.color,
                strokeColor: "transparent",
                radius: 16,
                strokeWidth: 0,
              },
            }
          ],
          type: "FeatureCollection",
        };
        if (this?.mapRef?.getLayer("highlight"))
          this?.mapRef?.removeLayer("highlight");
        if (!this?.mapRef?.getSource("highlight")) {
          this?.mapRef?.addSource("highlight", {
            type: "geojson",
            data,
          });
        } else {
          (
            this?.mapRef?.getSource("highlight") as maplibregl.GeoJSONSource
          )?.setData(data);
        }
        this?.mapRef?.addLayer({
          id: "highlight",
          type: "circle",
          source: "highlight",
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": ["get", "radius"],
            "circle-stroke-color": ["get", "strokeColor"],
            "circle-stroke-width": ["get", "strokeWidth"],
            // [
            //   "interpolate",
            //   ["linear"],
            //   ["zoom"],
            //   // zoom is 8 (or less) -> circle radius will be 2px
            //   8,
            //   2,
            //   // zoom is 18 (or greater) -> circle radius will be 20px
            //   16,
            //   16,
            // ],
          },
        });
      };
      if (!this.loaded) {
        this.mapRef.once("load", run);
      } else {
        run();
      }
    }
  }

  clearHighlight() {
    this.highlight = null;

    if (this.mapRef) {
      const run = () => {
        if (this?.mapRef?.getLayer("highlight"))
          this?.mapRef?.removeLayer("highlight");
      };
      if (!this.loaded) {
        this.mapRef.once("load", run);
      } else {
        run();
      }
    }
  }

  getCenterOffset(): [number, number] {
    if (typeof window === "undefined") return [0, 0];

    const isMobile = window.matchMedia("(max-width: 44.9999em)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 74.9999em)"
    ).matches;
    const isTabletWide = window.matchMedia(
      "(min-width: 62em) and (max-width: 74.9999em)"
    ).matches;
    const isDesktop = window.matchMedia(
      "(min-width: 75em) and (max-width: 119.9999em)"
    ).matches;

    // TODO: adjust to final values

    if (isMobile) {
      return [0, 30];
    } else if (isTablet && !isTabletWide) {
      return [0, 30];
    } else if (isTabletWide) {
      return [window.innerWidth / 4, 30];
    } else if (isDesktop) {
      return [725 / 2, 40];
    } else {
      console.log(5);

      console.log(
        window.innerWidth,

        (window.innerWidth - 675) / 2
      ),
        (window.innerWidth - (window.innerWidth - 675) / 2,
        (window.innerWidth - (window.innerWidth - 675) / 2) / 2);

      return [(675 + (window.innerWidth * 0.08 - 55)) / 2, 40];
    }
  }

  panTo(lng: number, lat: number) {
    if (this.mapRef) {
      this.mapRef.panTo(
        [lng, lat],
        {
          animate: true,
          duration: 1000,
          essential: true,
          offset: this.getCenterOffset(),
        },
        {
          cmAnimation: true,
        }
      );
    }
  }

  hideCluster() {
    if (this.mapRef) {
      const run = () => {
        this?.mapRef?.setLayoutProperty("clusters", "visibility", "none");
        this?.mapRef?.setLayoutProperty("cluster-count", "visibility", "none");
        this?.mapRef?.setLayoutProperty(
          "cluster-locations",
          "visibility",
          "none"
        );
      };
      if (!this.loaded) {
        this.mapRef.once("load", run);
      } else {
        run();
      }
    }
  }
  showCluster() {
    if (this.mapRef) {
      const run = () => {
        this?.mapRef?.setLayoutProperty("clusters", "visibility", "visible");
        this?.mapRef?.setLayoutProperty(
          "cluster-count",
          "visibility",
          "visible"
        );
        this?.mapRef?.setLayoutProperty(
          "cluster-locations",
          "visibility",
          "visible"
        );
      };
      if (!this.loaded) {
        this.mapRef.once("load", run);
      } else {
        run();
      }
    }
  }
}
