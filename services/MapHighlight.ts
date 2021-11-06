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

export class MapHighlight {
  cultureMap: CultureMap;
  
  events: Record<string, any> = {};

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(data?: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("highlight")) {
        this.cultureMap.map.addSource("highlight", {
          type: "geojson",
          data: data ?? {},
        });
      } else {
        (
          this.cultureMap?.map?.getSource("highlight") as any
        )?.setData(data ?? {});
      }
    }
  }

  render() {
    if (this.cultureMap?.map) {
      console.log("Run set hightlght view");
      if (
        !this.cultureMap?.map ||
        !this.cultureMap.map.getSource("highlight")
      )
        return;

      this.clear();

      this.cultureMap?.map?.addLayer({
        id: "highlight",
        type: "circle",
        source: "highlight",
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
          console.log("show highlithc popup", coordinates, feature?.properties);
          const titles = JSON.parse(feature?.properties?.title);
          const slugs = JSON.parse(feature?.properties?.slug);
          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            this.cultureMap.tHelper.getMultilangValue(slugs)
          );
        } catch (err) {console.log(err)}
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
        this.events["mouseenter-highlight"] = (e: any) => {

          console.log("h enter 1");
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            console.log("h enter 2");
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "highlight",
          this.events["mouseenter-highlight"]
        );

        this.events["mouseleave-highlight"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "highlight",
          this.events["mouseleave-highlight"]
        );
      }

      this.events["click-highlight"] = (e: any) => {
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
        "highlight",
        this.events["click-highlight"]
      );
    }
  }

  hide() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("highlight"))
        this.cultureMap?.map?.setLayoutProperty(
          "clustered-locations",
          "visibility",
          "none"
        );
    }
  }

  show() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("highlight"))
        this.cultureMap?.map?.setLayoutProperty(
          "highlight",
          "visibility",
          "visible"
        );
    }
  }

  clear() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("highlight"))
        this.cultureMap?.map?.removeLayer("highlight");

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
