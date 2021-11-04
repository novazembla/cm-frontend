import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";

export class MapViewClustered {
  cultureMap: CultureMap;
  baseDataLoaded = false;

  events: Record<string, any> = {};

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  setData(data?: any) {
    if (this.cultureMap?.map) {
      if (!this.cultureMap?.map) return;

      if (!this.cultureMap.map.getSource("clustered-locations")) {
        console.log(1232323);
        this.cultureMap.map.addSource("clustered-locations", {
          type: "geojson",
          data: data ?? this.cultureMap.geoJsonAllData ?? {},
          cluster: true,
          clusterMaxZoom: this.cultureMap.MAP_MAX_ZOOM, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        });
      } else {
        (
          this.cultureMap?.map?.getSource("clustered-locations") as any
        )?.setData(data ?? this.cultureMap.geoJsonAllData ?? {});
      }
      this.baseDataLoaded = !!data;
    }
  }

  init() {
    if (this.cultureMap?.map) {
      console.log("Run clustered view");
      if (
        !this.cultureMap?.map ||
        !this.cultureMap.map.getSource("clustered-locations")
      )
        return;

      this.cultureMap.map.addLayer({
        id: "clusters",
        type: "circle",
        source: "clustered-locations",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": this.cultureMap.config.colorDark,
          // "circle-color": [
          //   "step",
          //   ["get", "point_count"],
          //   "#51bbd6",
          //   100,
          //   "#f1f075",
          //   750,
          //   "#f28cb1",
          // ],
          "circle-radius": 24,
          // [
          //   "step",
          //   ["get", "point_count"],
          //   24,
          //   100,
          //   28,
          //   750,
          //   32,
          // ],
        },
      });

      this.cultureMap.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "clustered-locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Berlin Type Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      this.cultureMap.map.addLayer({
        id: "clustered-locations",
        type: "circle",
        source: "clustered-locations",
        filter: ["!", ["has", "point_count"]],
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

      this.cultureMap.map.on("click", "clusters", (e) => {
        if (this.cultureMap.clickBlock || !this.cultureMap.map) return;

        const features = this.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) {
          console.log("click 1");
          this.cultureMap.clusterDetail.hide();
        }
      });

      // inspect a cluster on click
      this.events["click-clusters"] = (e: any) => {
        if (!this.cultureMap?.map) return;

        var features = this.cultureMap.map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features?.length) return;
        var clusterId = features[0].properties.cluster_id;
        if (!clusterId) return;
        const clusterSource = (this.cultureMap.map as any).getSource("clustered-locations");

        if (!clusterSource) return;

        console.log("click 2", clusterId);
        clusterSource.getClusterChildren(
          clusterId,
          (err: any, children: any) => {
            if (err) return;
            clusterSource.getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: any) => {
                if (err || !this.cultureMap?.map) return;
                if (
                  (children?.length > 1 && children[0].properties?.cluster) ||
                  Math.floor(zoom) !== this.cultureMap.MAP_MAX_ZOOM - 1
                ) {
                  this.cultureMap.map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: this.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.min(zoom, this.cultureMap.MAP_MAX_ZOOM - 1),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  this.cultureMap.clusterDetail.hide();
                } else {
                  this.cultureMap.map.easeTo(
                    {
                      center: features[0].geometry.coordinates,
                      offset: this.cultureMap.getCenterOffset() ?? [0, 0],
                      zoom: Math.max(
                        16.5,
                        Math.min(this.cultureMap.map.getZoom(), this.cultureMap.MAP_MAX_ZOOM - 1.1)
                      ),
                    },
                    {
                      cmAnimation: true,
                    }
                  );
                  this.cultureMap.overlayZoomLevel = this.cultureMap.map.getZoom();
                  clusterSource.getClusterLeaves(
                    clusterId,
                    100,
                    0,
                    (err: any, leafFeatures: any) => {
                      if (err || !leafFeatures?.length) return;
                      const coordinates = features[0].geometry.coordinates.slice();

                      console.log(coordinates, leafFeatures)
                      this.cultureMap.clusterDetail.show(coordinates, leafFeatures);
                    }
                  );
                }
              }
            );
          }
        );
      };
      this.cultureMap.map.on(
        "click",
        "clusters",
        this.events["click-clusters"]
      );
      
      this.events["mouseenter-clusters"] = () => {
        if (!this.cultureMap.map) return;
        this.cultureMap.map.getCanvas().style.cursor = "pointer";
      };
      this.cultureMap.map.on(
        "mouseenter",
        "clusters",
        this.events["mouseenter-clusters"]
      );

      this.events["mouseleave-clusters"] = () => {
        if (!this.cultureMap.map) return;
        this.cultureMap.map.getCanvas().style.cursor = "";
      };
      this.cultureMap.map.on(
        "mouseleave",
        "clusters",
        this.events["mouseleave-clusters"]
      );

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
          console.log("click 3");
          this.cultureMap.clusterDetail.hide();
          this.cultureMap.popup.hide();
        }
      };
      this.cultureMap.map.on("zoom", this.events["zoom"]);

      if (primaryInput !== "touch") {
        this.events["mouseenter-clustered-locations"] = (e: any) => {
          if (this.cultureMap.isAnimating) return;
          if (this.cultureMap.map) {
            // Change the cursor style as a UI indicator.
            this.cultureMap.map.getCanvas().style.cursor = "pointer";
            if (e?.features?.[0]) showMapPop(e);
          }
        };

        this.cultureMap.map.on(
          "mouseenter",
          "clustered-locations",
          this.events["mouseenter-clustered-locations"]
        );

        this.events["mouseleave-clustered-locations"] = () => {
          if (this.cultureMap.map) {
            this.cultureMap.map.getCanvas().style.cursor = "";
            this.cultureMap.popup.hide();
          }
        };

        this.cultureMap.map.on(
          "mouseleave",
          "clustered-locations",
          this.events["mouseleave-clustered-locations"]
        );
      }

      this.events["click-clustered-locations"] = (e: any) => {
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
        "clustered-locations",
        this.events["click-clustered-locations"]
      );
    }
  }

  hide() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("clusters"))
        this.cultureMap?.map?.setLayoutProperty(
          "clusters",
          "visibility",
          "none"
        );
      if (this.cultureMap.map?.getLayer("cluster-count"))
        this.cultureMap?.map?.setLayoutProperty(
          "cluster-count",
          "visibility",
          "none"
        );
      if (this.cultureMap.map?.getLayer("clustered-locations"))
        this.cultureMap?.map?.setLayoutProperty(
          "clustered-locations",
          "visibility",
          "none"
        );
    }
  }

  show() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("clusters"))
        this.cultureMap?.map?.setLayoutProperty(
          "clusters",
          "visibility",
          "visible"
        );
      if (this.cultureMap.map?.getLayer("cluster-count"))
        this.cultureMap?.map?.setLayoutProperty(
          "cluster-count",
          "visibility",
          "visible"
        );
      if (this.cultureMap.map?.getLayer("clustered-locations"))
        this.cultureMap?.map?.setLayoutProperty(
          "clustered-locations",
          "visibility",
          "visible"
        );
    }
  }

  clear() {
    if (this.cultureMap?.map) {
      if (this.cultureMap.map?.getLayer("clusters"))
        this.cultureMap?.map?.removeLayer("clusters");
      if (this.cultureMap.map?.getLayer("cluster-count"))
        this.cultureMap?.map?.removeLayer("cluster-count");
      if (this.cultureMap.map?.getLayer("clustered-locations"))
        this.cultureMap?.map?.removeLayer("clustered-locations");

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
