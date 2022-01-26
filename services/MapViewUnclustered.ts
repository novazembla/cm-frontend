import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapViewUnclustered {
  cultureMap: CultureMap;
  bounds: maplibregl.LngLatBounds;
  events: Record<string, any> = {};
  isVisible: boolean = false;

  layers: string[] = ["unclustered-locations"];

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.bounds = new maplibregl.LngLatBounds(
      [this.cultureMap.config.lng, this.cultureMap.config.lat],
      [this.cultureMap.config.lng, this.cultureMap.config.lat]
    );
  }

  setData(data?: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map) return;

      self.hide();

      if (!self.cultureMap?.map) return;

      if (!self.cultureMap.map.getSource("unclustered-locations")) {
        self.cultureMap.map.addSource("unclustered-locations", {
          type: "geojson",
          data: data ?? self.cultureMap.geoJsonAllData ?? {},
        });
      } else {
        (
          self.cultureMap?.map?.getSource("unclustered-locations") as any
        )?.setData(data ?? self.cultureMap.geoJsonAllData ?? {});
      }

      let bounds: maplibregl.LngLatBounds | undefined;

      if ((data ?? self.cultureMap.geoJsonAllData ?? {})?.features?.length) {
        for (
          let i = 0;
          i <
          (data ?? self.cultureMap.geoJsonAllData ?? {})?.features?.length;
          i++
        ) {
          const coordinates = (data ?? self.cultureMap.geoJsonAllData ?? {})
            ?.features[i]?.geometry?.coordinates ?? [
            self.cultureMap.config.lng,
            self.cultureMap.config.lat,
          ];

          if (coordinates[0] !== 0 && coordinates[1] !== 0) {
            if (!bounds) {
              bounds = new maplibregl.LngLatBounds(coordinates, coordinates);
            } else {
              bounds.extend(coordinates);
            }
          }
        }
      }
      
      if (bounds) {
        self.bounds = bounds;
      } else {
        self.bounds = new maplibregl.LngLatBounds(
          [self.cultureMap.config.lng, self.cultureMap.config.lat],
          [self.cultureMap.config.lng, self.cultureMap.config.lat]
        );
      }
    }
  }

  render() {
    const self = this;
    if (self.cultureMap?.map) {
      if (
        !self.cultureMap?.map ||
        !self.cultureMap.map.getSource("unclustered-locations")
      )
        return;

      self.clear();

      self.cultureMap.map.addLayer({
        id: "unclustered-locations",
        type: "circle",
        source: "unclustered-locations",
        layout: {
          visibility: "none",
        },
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
        },
      });

      const showMapPop = (e: any) => {
        const feature = e?.features?.[0];
        if (!feature) return;
        const coordinates = feature.geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        try {
          const titles = JSON.parse(feature?.properties?.title);

          const slug = `/${
            self.cultureMap.tHelper.i18n?.language === "en" ? "location" : "ort"
          }/${self.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          self.cultureMap.popup.show(
            coordinates,
            self.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            slug
          );
        } catch (err) {}
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
        self.events["mouseenter-unclustered-locations"] = (e: any) => {
          if (self.cultureMap.isAnimating) return;
          if (self.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            self.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        self.cultureMap.map.on(
          "mouseenter",
          "unclustered-locations",
          self.events["mouseenter-unclustered-locations"]
        );

        self.events["mousemove-unclustered-locations"] = (e: any) => {
          if (self.cultureMap.isAnimating) return;
          if (self.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            self.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };
        self.cultureMap.map.on(
          "mousemove",
          "unclustered-locations",
          self.events["mousemove-unclustered-locations"]
        );

        self.events["mouseleave-unclustered-locations"] = () => {
          if (self.cultureMap.map) {
            self.cultureMap.map.getCanvas().style.cursor = "";
            self.cultureMap.popup.hide();
          }
        };

        self.cultureMap.map.on(
          "mouseleave",
          "unclustered-locations",
          self.events["mouseleave-unclustered-locations"]
        );
      }

      self.events["click-unclustered-locations"] = (e: any) => {
        if (primaryInput !== "touch") {
          self.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              const slug = `/${
                self.cultureMap.tHelper.i18n?.language === "en"
                  ? "location"
                  : "ort"
              }/${self.cultureMap.tHelper.getMultilangValue(
                JSON.parse(e?.features?.[0]?.properties?.slug)
              )}`;

              self.cultureMap.onMapPointNavigate(slug);
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      self.cultureMap.map.on(
        "click",
        "unclustered-locations",
        self.events["click-unclustered-locations"]
      );

      self.show();
    }
  }

  setFilter(filter: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (self.cultureMap.map?.getLayer("unclustered-locations"))
        self.cultureMap.map.setFilter("unclustered-locations", filter);
      //["match", ["get", "id"], ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-8", "loc-10"], true, false]
    }
  }

  fitToBounds() {
    const self = this;
    if (self.cultureMap?.map) {
      self.cultureMap.map?.fitBounds(self.bounds, {
        maxZoom: self.cultureMap.MAX_BOUNDS_ZOOM,
        linear: true,
        padding: self.cultureMap.getBoundsPadding(),
      });
    }
  }

  hide() {
    const self = this;
    if (!self.isVisible) return;

    self.cultureMap.toggleLayersVisibility(self.layers, "none");

    self.isVisible = false;
  }

  show() {
    const self = this;
    if (self.isVisible) return;

    self.cultureMap.toggleLayersVisibility(self.layers, "visible");

    self.isVisible = true;
  }

  clear() {
    const self = this;
    if (self.cultureMap?.map) {
      self.isVisible = false;

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
