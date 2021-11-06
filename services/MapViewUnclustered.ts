import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapViewUnclustered {
  cultureMap: CultureMap;
  baseDataLoaded = false;

  events: Record<string, any> = {};

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(data?: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("unclustered-locations")) {
        this.cultureMap.map.addSource("unclustered-locations", {
          type: "geojson",
          data: data ?? this.cultureMap.geoJsonAllData ?? {},
        });
      } else {
        (
          this.cultureMap?.map?.getSource("unclustered-locations") as any
        )?.setData(data ?? this.cultureMap.geoJsonAllData ?? {});
      }
      this.baseDataLoaded = !!data;
    }
  }

  render() {
    if (this.cultureMap?.map) {
      console.log("Run unclustered view");
      if (
        !this.cultureMap?.map ||
        !this.cultureMap.map.getSource("unclustered-locations")
      )
        return;

      this.clear();

      this.cultureMap.map.addLayer({
        id: "unclustered-locations",
        type: "circle",
        source: "unclustered-locations",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 16,
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
          const slugs = JSON.parse(feature?.properties?.slug);
          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            this.cultureMap.tHelper.getMultilangValue(slugs)
          );
        } catch (err) {}
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
        this.events["mouseenter-unclustered-locations"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "unclustered-locations",
          this.events["mouseenter-unclustered-locations"]
        );

        this.events["mouseleave-unclustered-locations"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "unclustered-locations",
          this.events["mouseleave-unclustered-locations"]
        );
      }

      this.events["click-unclustered-locations"] = (e: any) => {
        if (primaryInput !== "touch") {
          this.cultureMap.clusterDetail.hide();
          if (e?.features?.[0]?.properties?.slug) {
            try {
              this.cultureMap.onMapPointNavigate(
                this.cultureMap.tHelper.getMultilangValue(
                  JSON.parse(e?.features?.[0]?.properties?.slug)
                )
              );
            } catch (err) {}
          }
        } else {
          if (e?.features?.[0]?.properties) showMapPop(e);
        }
      };

      this.cultureMap.map.on(
        "click",
        "unclustered-locations",
        this.events["click-unclustered-locations"]
      );
    }
  }

  hide() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("unclustered-locations"))
        this.cultureMap?.map?.setLayoutProperty(
          "clustered-locations",
          "visibility",
          "none"
        );
    }
  }

  show() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("unclustered-locations"))
        this.cultureMap?.map?.setLayoutProperty(
          "unclustered-locations",
          "visibility",
          "visible"
        );
    }
  }

  clear() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("unclustered-locations"))
        this.cultureMap?.map?.removeLayer("unclustered-locations");

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
