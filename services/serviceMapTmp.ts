// import maplibregl from "maplibre-gl";
// import { I18n } from "next-i18next";
// import { NextRouter } from "next/router";

// import type { MapPin } from "~/types";

// type MapHighlight = {
//   id: number;
//   lng: number;
//   lat: number;
//   color: string;
// };

// export class CultureMap {
//   highlight: MapHighlight | null;

//   router: NextRouter | null;
//   map: maplibregl.Map | null;
//   loaded: boolean;

//   locationId: number | null;
//   i18n: I18n | null;

//   popup: maplibregl.Popup;

//   constructor() {
//     this.highlight = null;
//     this.map = null;
//     this.router = null;
//     this.locationId = null;
//     this.i18n = null;
//     this.loaded = false;
//     this.popup = new maplibregl.Popup({
//       closeButton: false,
//       closeOnClick: false,
//     });    
//   }


//   init(map: maplibregl.Map | null, router: NextRouter, i18n: I18n) {
//     this.map = map;
//     this.router = router;
//     this.i18n = i18n;

//     if (this.map) {
//       this.map.once("load", () => {
//         console.log("trigger loaded");
//         this.loaded = true;
//       });
//     }
//   }

//   onMapPointNavigate(properties: any) {
//     if (!properties?.slug) return null;

//     if (this?.i18n?.language === "en") {
//       this?.router?.push(`/location/${properties?.slug}`);
//     } else {
//       this?.router?.push(`/kartenpunkt/${properties?.slug}`);
//     }
//   }

//   showPopup(
//     coordinates: any,
//     title: any,
//     color: string,
//     slug: string,
//     offset?: any
//   ) {
//     // var description = e.features[0].properties.title;

//     try {
//       this.popup.setOffset(
//         offset?.length
//           ? offset
//           : primaryInput === "mouse"
//           ? POPUP_OFFSET_MOUSE
//           : POPUP_OFFSET_TOUCH
//       );

//       const containerElem: any = document.createElement("div");
//       const titleElem: any = document.createElement("div");
//       titleElem.className = "title clampThreeLines";
//       titleElem.innerText = title;

//       const arrowElem: any = document.createElement("a");
//       arrowElem.className = "arrow";
//       arrowElem.setAttribute("href", "#");
//       arrowElem.innerText = t("map.popup.viewLocation", "View location");
//       arrowElem.addEventListener("click", (e: any) => {
//         e.preventDefault();
//         this.onMapPointNavigate({ slug });
//       });
//       containerElem.className = "popup";
//       containerElem.style.borderColor = color;
//       // containerElem.style.clipPath = makeCircleHoleClipPathRule(15, "26px", "85px");

//       const flexElem: any = document.createElement("div");

//       containerElem.appendChild(titleElem);
//       containerElem.appendChild(flexElem);

//       if (primaryInput === "mouse") {
//         flexElem.className = "row";

//         containerElem.className = "popup mouse";
//         containerElem.addEventListener("mouseleave", () => {
//           this.popup.remove();
//         });
//         containerElem.addEventListener("click", () => {
//           this.onMapPointNavigate({ slug });
//         });
//       } else {
//         containerElem.className = "popup touch";
//         flexElem.className = "row-space-between";
//         const closeElem: any = document.createElement("a");
//         closeElem.className = "close";
//         closeElem.setAttribute("href", "#");
//         closeElem.innerText = t("map.popup.close", "Close popup");
//         closeElem.addEventListener("click", (e: any) => {
//           e.preventDefault();
//           this.popup.remove();
//         });
//         flexElem.appendChild(closeElem);
//       }

//       flexElem.appendChild(arrowElem);

//       // Populate the popup and set its coordinates
//       // based on the feature found.
//       this.popup.setLngLat(coordinates).setDOMContent(containerElem).addTo(this.map);

//       this.overlayZoomLevel = this.map.getZoom();
//     } catch (err) {}
//   }

//   clear() {
//     // TODO: what's to clear
//   }

//   setHighlight(highlight: MapHighlight) {

//     console.log(highlight)
//     this.highlight = highlight;

//     if (this.map) {
//       const run = () => {
//         const data = {
//           features: [
//             {
//               type: "Feature",
//               geometry: {
//                 coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
//                 type: "Point",
//               },
//               properties: {
//                 id: `loc-${highlight.id}`,
//                 color: "#fff",
//                 strokeColor: highlight.color,
//                 radius: 20,
//                 strokeWidth: 2,
//               },
//             },
//             {
//               type: "Feature",
//               geometry: {
//                 coordinates: [highlight.lng ?? 0.0, highlight.lat ?? 0.0],
//                 type: "Point",
//               },
//               properties: {
//                 id: `loc-${highlight.id}`,
//                 color: highlight.color,
//                 strokeColor: "transparent",
//                 radius: 16,
//                 strokeWidth: 0,
//               },
//             }
//           ],
//           type: "FeatureCollection",
//         };
//         if (this?.map?.getLayer("highlight"))
//           this?.map?.removeLayer("highlight");
//         if (!this?.map?.getSource("highlight")) {
//           this?.map?.addSource("highlight", {
//             type: "geojson",
//             data,
//           });
//         } else {
//           (
//             this?.map?.getSource("highlight") as maplibregl.GeoJSONSource
//           )?.setData(data);
//         }
//         this?.map?.addLayer({
//           id: "highlight",
//           type: "circle",
//           source: "highlight",
//           paint: {
//             "circle-color": ["get", "color"],
//             "circle-radius": ["get", "radius"],
//             "circle-stroke-color": ["get", "strokeColor"],
//             "circle-stroke-width": ["get", "strokeWidth"],
//             // [
//             //   "interpolate",
//             //   ["linear"],
//             //   ["zoom"],
//             //   // zoom is 8 (or less) -> circle radius will be 2px
//             //   8,
//             //   2,
//             //   // zoom is 18 (or greater) -> circle radius will be 20px
//             //   16,
//             //   16,
//             // ],
//           },
//         });
//       };
//       if (!this.loaded) {
//         this.map.once("load", run);
//       } else {
//         run();
//       }
//     }
//   }

//   clearHighlight() {
//     this.highlight = null;

//     if (this.map) {
//       const run = () => {
//         if (this?.map?.getLayer("highlight"))
//           this?.map?.removeLayer("highlight");
//       };
//       if (!this.loaded) {
//         this.map.once("load", run);
//       } else {
//         run();
//       }
//     }
//   }

//   getCenterOffset(withDrawer?: boolean): [number, number] {
//     if (typeof window === "undefined") return [0, 0];

//     const isMobile = window.matchMedia("(max-width: 44.9999em)").matches;
//     const isTablet = window.matchMedia(
//       "(min-width: 45em) and (max-width: 74.9999em)"
//     ).matches;
//     const isTabletWide = window.matchMedia(
//       "(min-width: 62em) and (max-width: 74.9999em)"
//     ).matches;
//     const isDesktop = window.matchMedia(
//       "(min-width: 75em) and (max-width: 119.9999em)"
//     ).matches;

//     if (isMobile) {
//       return withDrawer? [window.innerWidth * 0.4, 30] : [0, 30];
//     } else if (isTablet && !isTabletWide) {
//       return withDrawer? [window.innerWidth * 0.4, 30] : [0, 30];
//     } else if (isTabletWide) {
//       return [window.innerWidth * 0.3333, 30];
//     } else if (isDesktop) {
//       return [725 / 2, 40];
//     } else {
//       return [(695 + (window.innerWidth * 0.08 - 55)) / 2, 40];
//     }
//   }

//   panTo(lng: number, lat: number, withDrawer?: boolean) {
//     if (this.map) {
//       this.map.panTo(
//         [lng, lat],
//         {
//           animate: true,
//           duration: 1000,
//           essential: true,
//           offset: this.getCenterOffset(withDrawer),
//         },
//         {
//           cmAnimation: true,
//         }
//       );
//     }
//   }

//   hideCluster() {
//     if (this.map) {
//       const run = () => {
//         this?.map?.setLayoutProperty("clusters", "visibility", "none");
//         this?.map?.setLayoutProperty("cluster-count", "visibility", "none");
//         this?.map?.setLayoutProperty(
//           "cluster-locations",
//           "visibility",
//           "none"
//         );
//       };
//       if (!this.loaded) {
//         this.map.once("load", run);
//       } else {
//         run();
//       }
//     }
//   }
//   showCluster() {
//     if (this.map) {
//       const run = () => {
//         this?.map?.setLayoutProperty("clusters", "visibility", "visible");
//         this?.map?.setLayoutProperty(
//           "cluster-count",
//           "visibility",
//           "visible"
//         );
//         this?.map?.setLayoutProperty(
//           "cluster-locations",
//           "visibility",
//           "visible"
//         );
//       };
//       if (!this.loaded) {
//         this.map.once("load", run);
//       } else {
//         run();
//       }
//     }
//   }
// }
