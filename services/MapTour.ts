import { primaryInput } from "detect-it";
import maplibregl from "maplibre-gl";
import type { CultureMap } from "./CultureMap";

export type MapTourType = {
  id: number;
  lng: number;
  lat: number;
  number: number;
  color: string;
  title: any;
  slug: any;
};

export class MapTour {
  cultureMap: CultureMap;

  bounds: maplibregl.LngLatBounds;
  events: Record<string, any> = {};
  isVisible: boolean = false;

  layers: string[] = ["tourStops", "tourStopsHighlight", "tourStopsHighlightDot", "tourStopsHighlightNumber", "tourStopNumbers"];

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.bounds = new maplibregl.LngLatBounds(
      [this.cultureMap.config.lng, this.cultureMap.config.lat],
      [this.cultureMap.config.lng, this.cultureMap.config.lat]
    );
  }

  setTourPathData(path: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map) return;

      if (!self.cultureMap.map.getSource("tourPath")) {
        self.cultureMap.map.addSource("tourPath", {
          type: "geojson",
          data: path,
        });
      } else {
        (self.cultureMap?.map?.getSource("tourPath") as any)?.setData(path);
      }
    }
  }

  setTourStopsData(stops: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map) return;

      if (!self.cultureMap.map.getSource("tourStops")) {
        self.cultureMap.map.addSource("tourStops", {
          type: "geojson",
          data: stops,
        });
      } else {
        (self.cultureMap?.map?.getSource("tourStops") as any)?.setData(stops);
      }

      self.bounds = new maplibregl.LngLatBounds(
        [self.cultureMap.config.lng, self.cultureMap.config.lat],
        [self.cultureMap.config.lng, self.cultureMap.config.lat]
      );

      if (stops?.features?.length) {
        for (let i = 0; i < stops?.features?.length; i++) {
          if (stops?.features[i]?.geometry?.coordinates) {
            const coordinates = stops?.features[i]?.geometry?.coordinates ?? [
              self.cultureMap.config.lng,
              self.cultureMap.config.lat,
            ];

            if (coordinates[0] !== 0 && coordinates[1] !== 0) {
              self.bounds.extend(coordinates);
            }
          }
        }
      }
    }
  }

  renderPath() {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map || !self.cultureMap.map.getSource("tourPath"))
        return;

      if (self.cultureMap?.map?.getLayer("tourPath")) return;

      self.cultureMap?.map?.addLayer({
        id: "tourPath",
        type: "line",
        source: "tourPath",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": self.cultureMap.config.colorDark,
          "line-width": 2,
        },
      });
    }
  }

  renderStops() {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map || !self.cultureMap.map.getSource("tourStops"))
        return;

      if (self.cultureMap?.map?.getLayer("tourStops")) return;

      self.cultureMap.map.addLayer({
        id: "tourStops",
        type: "circle",
        source: "tourStops",
        filter: ["!", ["has", "number"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
        },
      });

      self.cultureMap.map.addLayer({
        id: "tourStopNumbers",
        type: "symbol",
        source: "tourStops",
        filter: ["has", "number"],
        layout: {
          "text-field": "{number}",
          "text-font": ["Berlin Type Bold"],
          "text-size": 13,
          "text-ignore-placement": true,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      self.cultureMap.map.addLayer({
        id: "tourStopsHighlight",
        type: "circle",
        source: "tourStops",
        filter: ["==", ["get", "highlight"], true],
        paint: {
          "circle-color": "#fff",
          "circle-radius": 20,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-width": 2,
        },
      });

      self.cultureMap.map.addLayer({
        id: "tourStopsHighlightDot",
        type: "circle",
        source: "tourStops",
        filter: ["==", ["get", "highlight"], true],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
        },
      });

      self.cultureMap.map.addLayer({
        id: "tourStopsHighlightNumber",
        type: "symbol",
        source: "tourStops",
        filter: [
          "all",
          ["has", "number"],
          ["==", ["get", "highlightNumber"], true],
        ],
        layout: {
          "text-field": "{number}",
          "text-font": ["Berlin Type Bold"],
          "text-size": 13,
          "text-ignore-placement": true,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      self.cultureMap.map.moveLayer("tourStops");
      self.cultureMap.map.moveLayer("tourStopNumbers");
      self.cultureMap.map.moveLayer("tourStopsHighlight");
      self.cultureMap.map.moveLayer("tourStopsHighlightDot");
      self.cultureMap.map.moveLayer("tourStopsHighlightNumber");

      const showMapPop = (e: any) => {
        const feature = e?.features?.[0];
        if (!feature || !feature?.properties?.title) return;
        const coordinates = feature.geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        try {
          const titles = JSON.parse(feature?.properties?.title);

          self.cultureMap.popup.show(
            coordinates,
            self.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            feature?.properties?.slug
          );
        } catch (err) {
          console.log(err);
        }
      };

      self.events["zoom"] = () => {
        if (self.cultureMap.isAnimating) return;

        if (
          self.cultureMap.map &&
          (self.cultureMap.map.getZoom() <
            self.cultureMap.overlayZoomLevel -
              self.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR ||
            self.cultureMap.map.getZoom() >
              self.cultureMap.overlayZoomLevel +
                self.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR)
        ) {
          self.cultureMap.overlayZoomLevel = 0;
          self.cultureMap.popup.hide();
        }
      };
      self.cultureMap.map.on("zoom", self.events["zoom"]);

      if (primaryInput !== "touch") {
        self.events["mouseenter-tourStops"] = (e: any) => {
          if (self.cultureMap.isAnimating) return;
          if (self.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            self.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        self.cultureMap.map.on(
          "mouseenter",
          "tourStops",
          self.events["mouseenter-tourStops"]
        );

        self.events["mouseleave-tourStops"] = () => {
          if (self.cultureMap.map) {
            self.cultureMap.map.getCanvas().style.cursor = "";
            self.cultureMap.popup.hide();
          }
        };

        self.cultureMap.map.on(
          "mouseleave",
          "tourStops",
          self.events["mouseleave-tourStops"]
        );
      }

      self.events["click-tourStops"] = (e: any) => {
        if (primaryInput !== "touch") {
          self.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              self.cultureMap.onMapPointNavigate(
                e?.features?.[0]?.properties?.slug
              );
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      self.cultureMap.map.on(
        "click",
        "tourStops",
        self.events["click-tourStops"]
      );
    }
  }

  fitToBounds() {
    const self = this;
    if (self.cultureMap?.map) {
      self.cultureMap.map?.fitBounds(self.bounds, {
        maxZoom: self.cultureMap.MAX_BOUNDS_ZOOM,
        linear: true,
        padding: self.cultureMap.getBoundsPadding(),
        animate: false,
      });
    }
  }

  hide() {
    const self = this;
    if (!self.isVisible) return;

    self.cultureMap.toggleLayersVisibility([...self.layers, "tourPath"], "none");

    self.isVisible = false;
  }

  show() {
    const self = this;
    if (self.isVisible) return;

    self.cultureMap.toggleLayersVisibility([...self.layers, "tourPath"], "visible");

    self.isVisible = true;    
  }

  clear() {
    const self = this;
    self.clearPath();
    self.clearStops();
    self.isVisible = false;
  }

  clearPath() {
    const self = this;
    self.cultureMap.removeLayers(["tourPath"]);
  }

  clearStops() {
    const self = this;
    if (self.cultureMap?.map) {

      self.cultureMap.removeLayers(self.layers);

      if (Object.keys(self.events).length) {
        Object.keys(self.events).forEach((key) => {
          if (self.cultureMap?.map) {
            const params: string[] = key.split("-");
            if (params.length > 1) {
              self.cultureMap.map.off(
                params[0] as any,
                params[1],
                self.events[key]
              );
            } else {
              self.cultureMap.map.off(key as any, self.events[key]);
            }
          }
        });
        self.events = {};
      }
    }
  }
}
