import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";

import { useAppTranslations } from "~/hooks";

import { useSettingsContext, useMapContext } from "~/provider";

import { useRouter } from "next/router";

import { locationsIdsQuery, locationsInitialQueryState } from ".";

export const ModuleComponentLocationsEmbed = () => {
  const cultureMap = useMapContext();
  cultureMap?.hideCurrentView();

  const router = useRouter();
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

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
      cultureMap?.fitToCurrentViewBounds();
      cultureMap?.showCurrentView();
    }
  }, [
    layzLocationIdsQueryResult.loading,
    layzLocationIdsQueryResult.error,
    layzLocationIdsQueryResult.data,
    cultureMap,
    isFiltered,
  ]);

  useEffect(() => {
    let where: any = [];
    let termsWhere: any = [];
    let allTerms: any[] = [];

    const urlParams = new URLSearchParams(window.location.search);

    const termsToI: string[] = router?.query?.toi
      ? Array.isArray(router.query.toi)
        ? router.query.toi
        : router.query.toi.split(",")
      : [];

    const termsToO: string[] = router?.query?.too
      ? Array.isArray(router.query.too)
        ? router.query.too
        : router.query.too.split(",")
      : [];

    const termsTA: string[] = router?.query?.ta
      ? Array.isArray(router.query.ta)
        ? router.query.ta
        : router.query.ta.split(",")
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
      cultureMap?.setView("unclustered");
    } else {
      cultureMap?.setView("clustered");
    }
    
    // if (where.length > 0) {
    //   layzLocationIdsQuery({
    //     variables: {
    //       where: (newQueryState as any).where,
    //     },
    //   });
    //   setIsFiltered(true);
    //   cultureMap?.hideCurrentView();
    // } else {
      cultureMap?.setCurrentViewData(undefined, true);
      cultureMap?.showCurrentView();
    //   setIsFiltered(false);
    // }
  }, [cultureMap, layzLocationIdsQuery, setIsFiltered, router]);

  return <></>;
};
