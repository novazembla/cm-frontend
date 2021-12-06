import { useEffect } from "react";

import {
  useMapContext,
  useConfigContext,
  useSettingsContext,
} from "~/provider";

import { useAppTranslations } from "~/hooks/useAppTranslations";
import { createTourStops } from "./tourShared";

export const ModuleComponentTourEmbed = ({ tour }: { tour: any }) => {
  const cultureMap = useMapContext();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { getMultilangValue } = useAppTranslations();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tour?.tourStops?.length > 0 && settings && cultureMap) {
      if (tour?.path) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          -1,
          settings
        );

        cultureMap.clearOnloadJobs();
        cultureMap.setTourPath(tour?.path);
        cultureMap.setTourStops(stops);
        cultureMap.fitToCurrentTourBounds();
      }
    }
    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [
    tour?.tourStops,
    tour?.path,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
  ]);

  return <></>;
};
