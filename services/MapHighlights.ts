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
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("highlights")) {
        this.cultureMap.map.addSource("highlights", {
          type: "geojson",
          data: data ?? {},
        });
      } else {
        (this.cultureMap?.map?.getSource("highlights") as any)?.setData(
          data ?? {}
        );
      }
    }
  }

  render() {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map || !this.cultureMap.map.getSource("highlights"))
        return;

      this.clear();

      this.cultureMap?.map?.addLayer({
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
            this.cultureMap.tHelper.i18n?.language === "en"
              ? "location"
              : "ort"
          }/${this.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.strokeColor ?? feature?.properties?.color,
            slug
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
        this.events["mouseenter-highlights"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "highlights",
          this.events["mouseenter-highlights"]
        );

        this.events["mouseleave-highlights"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "highlights",
          this.events["mouseleave-highlights"]
        );
      }

      this.events["click-highlights"] = (e: any) => {
        if (primaryInput !== "touch") {
          this.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              const slug = `/${
                this.cultureMap.tHelper.i18n?.language === "en"
                  ? "location"
                  : "ort"
              }/${this.cultureMap.tHelper.getMultilangValue(
                JSON.parse(e?.features?.[0]?.properties?.slug)
              )}`;

              this.cultureMap.onMapPointNavigate(slug);
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      this.cultureMap.map.on(
        "click",
        "highlights",
        this.events["click-highlights"]
      );
    }
  }

  hide() {
    if (!this.isVisible) return;
    
    this.cultureMap.toggleLayersVisibility(this.layers, "none");

    this.isVisible = false;
  }

  show() {
    if (this.isVisible) return;

    this.cultureMap.toggleLayersVisibility(this.layers, "visible");

    this.isVisible = true;
  }

  clear() {
    if (this.cultureMap?.map) {
      this.isVisible = false;

      this.cultureMap.removeLayers(this.layers);
      
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
