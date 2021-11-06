import maplibregl from "maplibre-gl";
import { primaryInput } from "detect-it";
import type { CultureMap } from "./CultureMap";


export class MapPopup {
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
    console.log(1);

    if (!this?.cultureMap?.map) return;
    console.log(11);
    try {
      this.popupAnimating = true;

      console.log(111);
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
      arrowElem.innerText = this?.cultureMap.tHelper.t("map.this.popupviewLocation", "View location");
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
        closeElem.innerText = this?.cultureMap.tHelper.t("map.this.popupclose", "Close popup");
        closeElem.addEventListener("click", (e: any) => {
          e.preventDefault();
          this.hide();
        });
        flexElem.appendChild(closeElem);
      }

      flexElem.appendChild(arrowElem);

      console.log(2);

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
    } catch (err) {
      console.log(err);
    }
  }

  hide() {
    if (!this?.cultureMap?.map) return;

    if (!this.popupAttached) return;

    this.popupAnimating = true;
    this.popup.getElement()?.querySelector(".popup")?.classList.add("fadeOut");

    setTimeout(() => {
      this.popupAnimating = false;

      console.log("hide npopup")
      this.popup.remove();
      this.popupAttached = false;
    }, 125);
  }
}
