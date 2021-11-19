import maplibregl from "maplibre-gl";
import type { CultureMap } from "./CultureMap";

export class MapUserLocation {
  cultureMap: CultureMap;

  events: Record<string, any> = {};
  lat: number | null = null;
  lng: number | null = null;

  marker: maplibregl.Marker | null = null;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(lng: number, lat: number) {
    this.lat = lat;
    this.lng = lng;
  }

  render() {
    if (this.cultureMap?.map && this.lat !== null && this.lng !== null) {
      this.clear();

      const el = document.createElement("div");
      el.className = "userlocation";

      const dot = document.createElement("div");
      dot.className = "dot";

      const dot2 = document.createElement("div");
      dot2.className = "dotdot";
      dot.appendChild(dot2);
      
      el.appendChild(dot);

      this.marker = new maplibregl.Marker(el)
        .setLngLat([this.lng, this.lat])
        .addTo(this.cultureMap?.map);
    }
  }

  clear() {
    if (this.cultureMap?.map && this.marker) {
      this.marker.remove();
      this.lat = null;
      this.lng = null;
    }
  }
}
