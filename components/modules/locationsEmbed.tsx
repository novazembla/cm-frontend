import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";

import { useMapContext } from "~/provider";

import {
  locationsIdsQuery,
  locationsInitialQueryState,
} from "./locationsShared";

export const ModuleComponentLocationsEmbed = ({
  filter,
}: {
  filter: string;
}) => {
  const cultureMap = useMapContext();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [isInit, setIsInit] = useState(false);

  const [layzLocationIdsQuery, layzLocationIdsQueryResult] = useLazyQuery(
    locationsIdsQuery,
    {
      variables: {
        where: locationsInitialQueryState.where,
      },
    }
  );

  useEffect(() => {
    if (
      isFiltered &&
      !layzLocationIdsQueryResult.loading &&
      !layzLocationIdsQueryResult.error &&
      layzLocationIdsQueryResult.data?.locationIds?.ids &&
      cultureMap &&
      cultureMap?.setCurrentViewData
    ) {
      if (layzLocationIdsQueryResult.data?.locationIds?.ids?.length) {
        cultureMap?.setFilteredViewData(
          layzLocationIdsQueryResult.data?.locationIds?.ids.map(
            (id: any) => `loc-${id}`
          )
        );
      } else {
        cultureMap?.setFilteredViewData([]);
      }
      cultureMap?.renderCurrentView();
      cultureMap?.showCurrentView();
      cultureMap?.fitToCurrentViewBounds();
    }
  }, [
    layzLocationIdsQueryResult.loading,
    layzLocationIdsQueryResult.error,
    layzLocationIdsQueryResult.data,
    cultureMap,
    isFiltered,
  ]);

  useEffect(() => {
    if (!cultureMap || isInit) return;

    let where: any = [];
    let termsWhere: any = [];
    let allTerms: any[] = [];

    const urlParams = new URLSearchParams(filter);

    const termsToI: string[] = urlParams.get("toi")
      ? urlParams.get("toi")?.split(",") ?? []
      : [];

    const termsToO: string[] = urlParams.get("too")
      ? urlParams.get("too")?.split(",") ?? []
      : [];

    const termsTA: string[] = urlParams.get("ta")
      ? urlParams.get("ta")?.split(",") ?? []
      : [];

    if (termsToI?.length) {
      allTerms = [...allTerms, ...termsToI.map((t: string) => parseInt(t))];
      if (urlParams.get("and") === "1") {
        termsWhere = [
          ...termsWhere,
          ...termsToI.map((t: string) => ({
            terms: {
              some: {
                id: {
                  in: [parseInt(t)],
                },
              },
            },
          })),
        ];
      }
    }

    if (termsToO?.length) {
      allTerms = [...allTerms, ...termsToO.map((t: string) => parseInt(t))];
      if (urlParams.get("and") === "1") {
        termsWhere = [
          ...termsWhere,
          ...termsToO.map((t: string) => ({
            terms: {
              some: {
                id: {
                  in: [parseInt(t)],
                },
              },
            },
          })),
        ];
      }
    }

    if (termsTA?.length) {
      allTerms = [...allTerms, ...termsTA.map((t: string) => parseInt(t))];
      if (urlParams.get("and") === "1") {
        termsWhere = [
          ...termsWhere,
          ...termsTA.map((t: string) => ({
            terms: {
              some: {
                id: {
                  in: [parseInt(t)],
                },
              },
            },
          })),
        ];
      }
    }

    if (
      allTerms?.length &&
      (urlParams.get("and") === "0" || !urlParams.get("and"))
    ) {
      termsWhere.push({
        terms: {
          some: {
            id: {
              in: allTerms,
            },
          },
        },
      });
    }

    const s = urlParams.get("s") ?? "";

    if (s && s.trim() && s.length > 2) {
      where.push({
        fullText: {
          contains: s,
          mode: "insensitive",
        },
      });
    }

    let newQueryState = {};

    if (termsWhere?.length) {
      if (urlParams.get("and") === "1") {
        where.push({
          AND: termsWhere,
        });
      } else {
        where.push({
          OR: termsWhere,
        });
      }
    }

    if (where?.length) {
      newQueryState = {
        ...newQueryState,
        where: {
          AND: where,
        },
      };
    } else {
      newQueryState = {
        ...newQueryState,
        where: {},
      };
    }

    if (urlParams.get("cluster") === "0") {
      console.log("current view unclustered");
      cultureMap?.setView("unclustered");
    } else {
      console.log("current view clustered");
      cultureMap?.setView("clustered");
    }

    cultureMap?.clearOnloadJobs();

    if (where.length > 0) {
      console.log("filtered", where);
      layzLocationIdsQuery({
        variables: {
          where: (newQueryState as any).where,
        },
      });
      setIsFiltered(true);
    } else {
      console.log("not filtered");

      cultureMap?.setCurrentViewData(undefined, true);
      cultureMap?.renderCurrentView();
      cultureMap?.fitToCurrentViewBounds();
      setIsFiltered(false);
    }
    setIsInit(true);
  }, [
    cultureMap,
    layzLocationIdsQuery,
    setIsFiltered,
    filter,
    isInit,
    setIsInit,
  ]);

  return <></>;
};
