import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";
import { MapSpiderfier } from "./MapSpiderfier";

export class MapClusterDetail {
  cultureMap: CultureMap;
  spiderfier: MapSpiderfier | null = null;
  clickBlock = false;
  clusterDetailOpen = false;
  clusterDetail: any = null;
  clusterDetailAnimating = false;
  clusterDetailClusterHash: string | null = null;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  init() {
    if (!this.cultureMap.map) return;

    this.spiderfier = new MapSpiderfier(this.cultureMap.map, {
      color: this.cultureMap.config.colorDark,
      dotRadius: 16,
      clusterRadius: 24,
      onClick: (e: any, spiderLeg: any) => {
        if (primaryInput === "mouse") {
          const slug = `/${
            this.cultureMap.tHelper.i18n?.language === "en"
              ? "location"
              : "ort"
          }/${this.cultureMap.tHelper.getMultilangValue(
            spiderLeg?.feature?.slug
          )}`;

          this.cultureMap.onMapPointNavigate(slug);
        }
      },
      initializeLeg: (spiderLeg: any) => {
        const showLegPopup = (e: any) => {
          if (this.cultureMap.isAnimating) return;

          this.cultureMap.clickBlock = true;
          e.preventDefault();

          this.cultureMap.overlayZoomLevel =
            this.cultureMap?.map?.getZoom() ?? 0;

          this.cultureMap.popup.show(
            spiderLeg.latLng,
            this.cultureMap.tHelper.getMultilangValue(
              spiderLeg?.feature?.title
            ),
            spiderLeg?.feature?.color,
            this.cultureMap.tHelper.getMultilangValue(spiderLeg?.feature?.slug),
            [
              spiderLeg.popupOffset.bottom[0] +
                (primaryInput === "mouse"
                  ? this.cultureMap.POPUP_OFFSET_MOUSE[0]
                  : this.cultureMap.POPUP_OFFSET_TOUCH[0]),
              spiderLeg.popupOffset.bottom[1] +
                (primaryInput === "mouse"
                  ? this.cultureMap.POPUP_OFFSET_MOUSE[1]
                  : this.cultureMap.POPUP_OFFSET_TOUCH[1]),
            ]
          );

          setTimeout(() => {
            this.cultureMap.clickBlock = false;
          }, 100);
        };

        if (primaryInput === "mouse") {
          spiderLeg.elements.pin.addEventListener("mouseenter", showLegPopup);

          spiderLeg.elements.pin.addEventListener("mouseleave", () => {
            this.cultureMap.popup.hide();
          });
        } else {
          spiderLeg.elements.pin.addEventListener("click", showLegPopup);
        }
      },
    });
  }

  show(coordinates: [number, number], leafFeatures: any) {
    if (!this.spiderfier) return;

    const newHash = `${coordinates[0].toFixed(6)}-${coordinates[1].toFixed(6)}`;
    if (this.clusterDetailOpen && this.clusterDetailClusterHash !== newHash) {
      this.spiderfier.unspiderfy();
      this.clusterDetailOpen = false;
      this.clusterDetailAnimating = false;
    }

    if (
      !this.clusterDetailClusterHash ||
      (!this.clusterDetailOpen && !this.clusterDetailAnimating)
    ) {
      this.clusterDetail = this.spiderfier.spiderfy(
        coordinates,
        leafFeatures.map((leafFeature: any) => {
          return leafFeature.properties;
        })
      );
      this.clusterDetailClusterHash = newHash;

      setTimeout(() => {
        this.clusterDetail?.map((e: any) =>
          e?.elements?.container?.classList.add("fadeIn")
        );
        setTimeout(() => {
          this.clusterDetailAnimating = true;
        }, 200);
      }, 20);
      this.clusterDetailOpen = true;
    }
  }

  hide() {
    const currentHash = this.clusterDetailClusterHash;
    if (!this.spiderfier || !this.clusterDetailOpen) return;

    this.clusterDetail?.map((e: any) =>
      e?.elements?.container?.classList.add("fadeOut")
    );

    setTimeout(() => {
      if (this.clusterDetailClusterHash === currentHash) {
        this.clusterDetailAnimating = false;
        this.spiderfier?.unspiderfy();
        this.clusterDetailOpen = false;
        this.clusterDetailClusterHash = null;
        this.clusterDetail = null;
      }
    }, 200);
  }
}
