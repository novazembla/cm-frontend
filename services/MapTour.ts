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

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.bounds = new maplibregl.LngLatBounds(
      [this.cultureMap.config.lng, this.cultureMap.config.lat],
      [this.cultureMap.config.lng, this.cultureMap.config.lat]
    );
  }

  setTourData(path: any, stops: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("tourPath")) {
        this.cultureMap.map.addSource("tourPath", {
          type: "geojson",
          data: path,
        });
      } else {
        (this.cultureMap?.map?.getSource("tourPath") as any)?.setData(path);
      }

      if (!this.cultureMap.map.getSource("tourStops")) {
        this.cultureMap.map.addSource("tourStops", {
          type: "geojson",
          data: stops,
        });
      } else {
        (this.cultureMap?.map?.getSource("tourStops") as any)?.setData(stops);
      }

      this.bounds = new maplibregl.LngLatBounds(
        [this.cultureMap.config.lng, this.cultureMap.config.lat],
        [this.cultureMap.config.lng, this.cultureMap.config.lat]
      );

      if (stops?.features?.length) {
        for (let i = 0; i < stops?.features?.length; i++) {
          if (stops?.features[i]?.geometry?.coordinates) {
            const coordinates = stops?.features[i]?.geometry?.coordinates ?? [
              this.cultureMap.config.lng,
              this.cultureMap.config.lat,
            ];

            if (coordinates[0] !== 0 && coordinates[1] !== 0) {
              this.bounds.extend(coordinates);
            }
          }
        }
      }
    }
  }

  render() {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map || !this.cultureMap.map.getSource("tourStops"))
        return;

      this.clear();

      this.cultureMap?.map?.addLayer({
        id: "tourPath",
        type: "line",
        source: "tourPath",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": this.cultureMap.config.colorDark,
          "line-width": 2,
        },
      });

      this.cultureMap.map.addLayer({
        id: "tourStops",
        type: "circle",
        source: "tourStops",
        filter: ["!", ["has", "number"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
        },
      });

      this.cultureMap.map.addLayer({
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

      this.cultureMap.map.addLayer({
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

      this.cultureMap.map.addLayer({
        id: "tourStopsHighlightDot",
        type: "circle",
        source: "tourStops",
        filter: ["==", ["get", "highlight"], true],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
        },
      });


      this.cultureMap.map.addLayer({
        id: "tourStopsHighlightNumber",
        type: "symbol",
        source: "tourStops",
        filter: ["all", ["has", "number"], ["==", ["get", "highlightNumber"], true]],
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

      this.cultureMap.map.moveLayer("tourPath", "tourStops");
      this.cultureMap.map.moveLayer("tourStops", "tourStopNumbers");

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

          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            feature?.properties?.slug
          );
        } catch (err) {
          console.log(err);
        }
      };

      this.events["zoom"] = () => {
        if (this.cultureMap.isAnimating) return;

        if (
          this.cultureMap.map &&
          (this.cultureMap.map.getZoom() <
            this.cultureMap.overlayZoomLevel -
              this.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR ||
            this.cultureMap.map.getZoom() >
              this.cultureMap.overlayZoomLevel +
                this.cultureMap.ZOOM_LEVEL_HIDE_ADJUSTOR)
        ) {
          this.cultureMap.overlayZoomLevel = 0;
          this.cultureMap.popup.hide();
        }
      };
      this.cultureMap.map.on("zoom", this.events["zoom"]);

      if (primaryInput !== "touch") {
        this.events["mouseenter-tourStops"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "tourStops",
          this.events["mouseenter-tourStops"]
        );

        this.events["mouseleave-tourStops"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "tourStops",
          this.events["mouseleave-tourStops"]
        );
      }

      this.events["click-tourStops"] = (e: any) => {
        if (primaryInput !== "touch") {
          this.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              this.cultureMap.onMapPointNavigate(
                e?.features?.[0]?.properties?.slug
              );
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      this.cultureMap.map.on(
        "click",
        "tourStops",
        this.events["click-tourStops"]
      );
    }
  }

  fitToBounds() {
    if (this.cultureMap?.map) {
      this.cultureMap.map?.fitBounds(this.bounds, {
        maxZoom: this.cultureMap.MAX_BOUNDS_ZOOM,
        linear: true,
        padding: this.cultureMap.getBoundsPadding(),
        animate: false,
      });
    }
  }

  hide() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("tourStops"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStops",
          "visibility",
          "none"
        );
      if (this.cultureMap?.map?.getLayer("tourStopsHighlight"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlight",
          "visibility",
          "none"
        );
      if (this.cultureMap?.map?.getLayer("tourStopsHighlightDot"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlightDot",
          "visibility",
          "none"
        );
      if (this.cultureMap?.map?.getLayer("tourStopsHighlightNumber"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlightNumber",
          "visibility",
          "none"
        );
      if (this.cultureMap?.map?.getLayer("tourStopNumbers"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopNumbers",
          "visibility",
          "none"
        );
      if (this.cultureMap?.map?.getLayer("tourPath"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourPath",
          "visibility",
          "none"
        );
    }
  }

  show() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("tourStops"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStops",
          "visibility",
          "visible"
        );
      if (this.cultureMap?.map?.getLayer("tourStopsHighlight"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlight",
          "visibility",
          "visible"
        );
      if (this.cultureMap?.map?.getLayer("tourStopsHighlightDot"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlightDot",
          "visibility",
          "visible"
        );

      if (this.cultureMap?.map?.getLayer("tourStopsHighlightNumber"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopsHighlightNumber",
          "visibility",
          "visible"
        );

      if (this.cultureMap?.map?.getLayer("tourStopNumbers"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourStopNumbers",
          "visibility",
          "visible"
        );
      if (this.cultureMap?.map?.getLayer("tourPath"))
        this.cultureMap?.map?.setLayoutProperty(
          "tourPath",
          "visibility",
          "visible"
        );
    }
  }

  clear() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("tourStops"))
        this.cultureMap?.map?.removeLayer("tourStops");

      if (this.cultureMap?.map?.getLayer("tourStopsHighlight"))
        this.cultureMap?.map?.removeLayer("tourStopsHighlight");

      if (this.cultureMap?.map?.getLayer("tourStopsHighlightDot"))
        this.cultureMap?.map?.removeLayer("tourStopsHighlightDot");

      if (this.cultureMap?.map?.getLayer("tourStopsHighlightNumber"))
        this.cultureMap?.map?.removeLayer("tourStopsHighlightNumber");

      if (this.cultureMap?.map?.getLayer("tourStopNumbers"))
        this.cultureMap?.map?.removeLayer("tourStopNumbers");

      if (this.cultureMap?.map?.getLayer("tourPath"))
        this.cultureMap?.map?.removeLayer("tourPath");

      if (Object.keys(this.events).length) {
        Object.keys(this.events).forEach((key) => {
          if (this.cultureMap?.map) {
            const params: string[] = key.split("-");
            if (params.length > 1) {
              this.cultureMap.map.off(
                params[0] as any,
                params[1],
                this.events[key]
              );
            } else {
              this.cultureMap.map.off(key, this.events[key]);
            }
          }
        });
        this.events = {};
      }
    }
  }
}
