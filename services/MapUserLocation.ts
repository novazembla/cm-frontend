import type { CultureMap } from "./CultureMap";

export class MapUserLocation {
  cultureMap: CultureMap;

  events: Record<string, any> = {};

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(data?: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("userlocation")) {
        this.cultureMap.map.addSource("userlocation", {
          type: "geojson",
          data: data ?? {},
        });
      } else {
        (this.cultureMap?.map?.getSource("userlocation") as any)?.setData(
          data ?? {}
        );
      }
    }
  }

  render() {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map || !this.cultureMap.map.getSource("userlocation"))
        return;

      this.clear();

      this.cultureMap?.map?.addLayer({
        id: "userlocation",
        type: "circle",
        source: "userlocation",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["get", "radius"],
          "circle-stroke-color": ["get", "strokeColor"],
          "circle-stroke-width": ["get", "strokeWidth"],
        },
      });
    }
  }

  hide() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("UserLocation"))
        this.cultureMap?.map?.setLayoutProperty(
          "userlocation",
          "visibility",
          "none"
        );
    }
  }

  show() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("UserLocation"))
        this.cultureMap?.map?.setLayoutProperty(
          "userlocation",
          "visibility",
          "visible"
        );
    }
  }

  clear() {
    if (this.cultureMap?.map) {
      if (this.cultureMap?.map?.getLayer("userlocation"))
        this.cultureMap?.map?.removeLayer("userlocation");
    }
  }
}
