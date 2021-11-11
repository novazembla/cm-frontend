import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";
import { AnyKindOfDictionary } from "lodash";

export class MapPopup {
  locationHash: string = "";

  closeTimeout1: any = null;
  closeTimeout2: any = null;

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  popupAnimating = false;
  popupAttached = false;
  cultureMap: CultureMap;

  constructor(cultureMap: CultureMap) {
    this.cultureMap = cultureMap;
  }

  show(
    coordinates: any,
    title: any,
    color: string,
    slug: string,
    offset?: any
  ) {
    if (!this?.cultureMap?.map) return;

    const hash = `${coordinates[0].toFixed(6)}-${coordinates[1].toFixed(6)}`;

    if (this.popupAttached && this.locationHash === hash) return;

    clearTimeout(this.closeTimeout1);
    clearTimeout(this.closeTimeout2);

    try {
      this.popupAnimating = true;

      this.popup.setOffset(
        offset?.length
          ? offset
          : primaryInput === "mouse"
          ? this.cultureMap.POPUP_OFFSET_MOUSE
          : this.cultureMap.POPUP_OFFSET_TOUCH
      );

      const containerElem: any = document.createElement("div");
      const titleElem: any = document.createElement("div");
      titleElem.className = "title clampThreeLines";
      titleElem.innerText = title;

      const arrowElem: any = document.createElement("a");
      arrowElem.className = "arrow";
      arrowElem.setAttribute("href", "#");
      arrowElem.innerText = this?.cultureMap.tHelper.t(
        "map.popupviewLocation",
        "View location"
      );
      arrowElem.addEventListener("click", (e: any) => {
        if (!this?.cultureMap?.map) return;
        e.preventDefault();
        this.cultureMap.onMapPointNavigate(slug);
        this.hide();
      });
      containerElem.className = "popup";
      containerElem.style.borderColor = color;

      const flexElem: any = document.createElement("div");

      containerElem.appendChild(titleElem);
      containerElem.appendChild(flexElem);

      if (primaryInput === "mouse") {
        flexElem.className = "row";

        containerElem.className = "popup mouse";
        containerElem.addEventListener("mouseenter", () => {
          clearTimeout(this.closeTimeout1);
          clearTimeout(this.closeTimeout2);
        });
        containerElem.addEventListener("mouseleave", () => {
          this.hide();
        });
        containerElem.addEventListener("click", () => {
          if (!this?.cultureMap?.map) return;
          this?.cultureMap.onMapPointNavigate(slug);
          this.hide();
        });
      } else {
        containerElem.className = "popup touch";
        flexElem.className = "row-space-between";
        const closeElem: any = document.createElement("a");
        closeElem.className = "close";
        closeElem.setAttribute("href", "#");
        closeElem.innerText = this?.cultureMap.tHelper.t(
          "map.popupclose",
          "Close popup"
        );
        closeElem.addEventListener("click", (e: any) => {
          e.preventDefault();
          this.hide();
        });
        flexElem.appendChild(closeElem);
      }

      flexElem.appendChild(arrowElem);

      this.locationHash = hash;
      // Populate the popup and set its coordinates
      // based on the feature found.
      this.popup
        .setLngLat(coordinates)
        .setDOMContent(containerElem)
        .addTo(this.cultureMap.map);
      this.popupAttached = true;
      this.cultureMap.overlayZoomLevel = this?.cultureMap?.map?.getZoom() ?? 0;

      setTimeout(() => {
        containerElem.classList.add("fadeIn");
        setTimeout(() => {
          this.popupAnimating = false;
        }, 125);
      }, 20);
    } catch (err) {}
  }

  hide() {
    if (!this?.cultureMap?.map) return;

    if (!this.popupAttached) return;

    clearTimeout(this.closeTimeout1);
    clearTimeout(this.closeTimeout2);

    this.closeTimeout1 = setTimeout(() => {
      this.popupAnimating = true;
      this.popup
        .getElement()
        ?.querySelector(".popup")
        ?.classList.add("fadeOut");
    }, 60);
    this.closeTimeout2 = setTimeout(() => {
      this.popupAnimating = false;
      this.popup.remove();
      this.popupAttached = false;
      this.locationHash = "";
    }, 185);
  }
}
