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
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      this.hide();

      setTimeout(() => {
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

        this.bounds = new maplibregl.LngLatBounds(
          [this.cultureMap.config.lng, this.cultureMap.config.lat],
          [this.cultureMap.config.lng, this.cultureMap.config.lat]
        );

        if ((data ?? this.cultureMap.geoJsonAllData ?? {})?.features?.length) {
          for (
            let i = 0;
            i <
            (data ?? this.cultureMap.geoJsonAllData ?? {})?.features?.length;
            i++
          ) {
            const coordinates = (data ?? this.cultureMap.geoJsonAllData ?? {})
              ?.features[i]?.geometry?.coordinates ?? [
              this.cultureMap.config.lng,
              this.cultureMap.config.lat,
            ];

            if (coordinates[0] !== 0 && coordinates[1] !== 0) {
              this.bounds.extend(coordinates);
            }
          }
        }
      }, 60);
    }
  }

  render() {
    if (this.cultureMap?.map) {
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
            this.cultureMap.tHelper.i18n?.language === "en"
              ? "location"
              : "kartenpunkt"
          }/${this.cultureMap.tHelper.getMultilangValue(
            JSON.parse(feature?.properties?.slug)
          )}`;

          this.cultureMap.popup.show(
            coordinates,
            this.cultureMap.tHelper.getMultilangValue(titles),
            feature?.properties?.color,
            slug
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

        this.events["mousemove-unclustered-locations"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };
        this.cultureMap.map.on(
          "mousemove",
          "unclustered-locations",
          this.events["mousemove-unclustered-locations"]
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
              const slug = `/${
                this.cultureMap.tHelper.i18n?.language === "en"
                  ? "location"
                  : "kartenpunkt"
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
        "unclustered-locations",
        this.events["click-unclustered-locations"]
      );

      this.show();
    }
  }

  setFilter(filter: any) {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("unclustered-locations"))
        this.cultureMap.map.setFilter("unclustered-locations", filter);
      //["match", ["get", "id"], ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-8", "loc-10"], true, false]
    }
  }

  fitToBounds() {
    if (this.cultureMap?.map) {
      this.cultureMap.map?.fitBounds(this.bounds, {
        maxZoom: this.cultureMap.MAX_BOUNDS_ZOOM,
        linear: true,
        padding: this.cultureMap.getBoundsPadding(),
      });
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
