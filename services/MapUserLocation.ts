import maplibregl from "maplibre-gl";
import type { CultureMap } from "./CultureMap";

export class MapUserLocation {
  cultureMap: CultureMap;

  events: Record<string, any> = {};
  lat: number | null = null;
  lng: number | null = null;

  hash: string;

  marker: maplibregl.Marker | null = null;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
    this.hash = "";
  }

  setData(lng: number, lat: number) {
    this.lng = lng;
    this.lat = lat;
  }

  render() {
    const self = this;

    if (self.cultureMap?.map && self.lng !== null && self.lat !== null) {
      const currentHash = `${self.lng.toFixed(5)}-${self.lat.toFixed(5)}`;

      if (currentHash === this.hash) return;
      this.hash = currentHash;

      self.clear();

      const el = document.createElement("div");
      el.className = "userlocation";

      const dot = document.createElement("div");
      dot.className = "dot";

      const dot2 = document.createElement("div");
      dot2.className = "dotdot";
      dot.appendChild(dot2);

      el.appendChild(dot);

      self.marker = new maplibregl.Marker(el)
        .setLngLat([self.lng, self.lat])
        .addTo(self.cultureMap?.map);
    }
  }

  clear() {
    const self = this;
    if (self.cultureMap?.map && self.marker) {
      self.marker.remove();
    }
  }
}
