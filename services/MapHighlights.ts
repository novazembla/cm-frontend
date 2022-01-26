import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export type MapHighlightType = {
  id: number;
  lng: number;
  lat: number;
  color: string;
  title: any;
  slug: any;
};

export class MapHighlights {
  cultureMap: CultureMap;
  isVisible: boolean = false;

  events: Record<string, any> = {};

  layers: string[] = ["highlights"];
  
  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(data?: any) {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map) return;

      if (!self.cultureMap.map.getSource("highlights")) {
        self.cultureMap.map.addSource("highlights", {
          type: "geojson",
          data: data ?? {},
        });
      } else {
        (self.cultureMap?.map?.getSource("highlights") as any)?.setData(
          data ?? {}
        );
      }
    }
  }

  render() {
    const self = this;
    if (self.cultureMap?.map) {
      if (!self.cultureMap?.map || !self.cultureMap.map.getSource("highlights"))
        return;

      self.clear();

      self.cultureMap?.map?.addLayer({
        id: "highlights",
        type: "circle",
        source: "highlights",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["get", "radius"],
          "circle-stroke-color": ["get", "strokeColor"],
          "circle-stroke-width": ["get", "strokeWidth"],
        },
      });

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

          const slug = `/${
            self.cultureMap.tHelper.i18n?.language === "en"
              ? "location"
              : "ort"
          }/${self.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          self.cultureMap.popup.show(
            coordinates,
            self.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.strokeColor ?? feature?.properties?.color,
            slug
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
        self.events["mouseenter-highlights"] = (e: any) => {
          if (self.cultureMap.isAnimating) return;
          if (self.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            self.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        self.cultureMap.map.on(
          "mouseenter",
          "highlights",
          self.events["mouseenter-highlights"]
        );

        self.events["mouseleave-highlights"] = () => {
          if (self.cultureMap.map) {
            self.cultureMap.map.getCanvas().style.cursor = "";
            self.cultureMap.popup.hide();
          }
        };

        self.cultureMap.map.on(
          "mouseleave",
          "highlights",
          self.events["mouseleave-highlights"]
        );
      }

      self.events["click-highlights"] = (e: any) => {
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
        "highlights",
        self.events["click-highlights"]
      );
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
