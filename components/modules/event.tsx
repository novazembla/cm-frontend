import { useState, useEffect, Key } from "react";
import { gql } from "@apollo/client";

import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { CardLocation } from "~/components/ui/CardLocation";
import { ApiImage } from "~/components/ui/ApiImage";

import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { getApolloClient } from "~/services";
import type { MapHighlightType } from "~/services/MapHighlights";

import {
  useConfigContext,
  useMapContext,
  useSettingsContext,
} from "~/provider";
import {
  Box,
  SimpleGrid,
  Text,
  chakra,
  Grid,
  Collapse,
  Link,
} from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useRouter } from "next/router";
import {
  isEmptyHtml,
  getLocationColors,
  getSeoAppTitle,
  getSeoImage,
  getMetaDescriptionContent,
} from "~/utils";
import NextHeadSeo from "next-head-seo";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQueryPartial } from "~/graphql";
import { ShareIcons } from "../ui/ShareIcons";
import { AccessibilityInformation } from "./accessibilityInformation";

const eventQuery = gql`
  query ($slug: String!) {
    ${settingsQueryPartial}
    event(slug: $slug) {
      id
      title
      slug
      address
      organiser
      socialMedia
      isFree
      description
      metaDesc
      firstEventDate
      lastEventDate
      terms {
        id
        taxonomyId
        iconKey
        name
        slug
      }
      locations {
        id
        title
        slug
        description
        lat
        lng
        heroImage {
          id
          status
          meta
          alt
          credits
          cropPosition
        }
        terms {
          id
          name
          slug
        }
        primaryTerms {
          id
          name
          slug
        }
      }
      dates {
        begin
        end
        date
      }
      heroImage {
        id
        status
        meta
        alt
        credits
        cropPosition
      }
    }
  }
`;

const getTime = (date: any, locale: string, includeEnd: boolean) => {
  try {
    const begin = new Date(date.begin);
    const end = new Date(date.end);
    if (
      begin.getHours() === end.getHours() &&
      begin.getMinutes() === end.getMinutes() &&
      begin.getHours() < 6
    ) {
      return "";
    }

    if (begin && !includeEnd) {
      return `${begin.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })}${locale === "de" ? " UHR" : ""}`;
    } else if (begin && includeEnd) {
      if (end && begin < end) {
        return `${begin.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })} &mdash; ${end.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })} ${locale === "de" ? " UHR" : ""}`;
      } else {
        return `${begin.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })}${locale === "de" ? " UHR" : ""}`;
      }
    }
  } catch (err) {}

  return "";
};

export const ModuleComponentEvent = ({
  event,
  ...props
}: {
  event: any;
  props: any;
}) => {
  const router = useRouter();
  const cultureMap = useMapContext();
  const settings = useSettingsContext();
  const config = useConfigContext();

  const { t, getMultilangValue, i18n, getMultilangHtml } = useAppTranslations();
  const { isMobile } = useIsBreakPoint();

  const [showDates, setShowDates] = useState(false);

  let dateInfo: any = t("event.missingData.eventDate", "TBD");
  let timeInfo: any = "";

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const [highlight, setHighlight] = useState<MapHighlightType | null>(null);

  const taxonomies =
    event?.terms?.reduce((acc: any, term: any) => {
      if (settings?.terms[term.id]?.taxonomyId) {
        const tax = Object.keys(settings?.taxMapping).find(
          (key) => parseInt(settings?.taxMapping[key]) === term.taxonomyId
        );

        if (!tax) return acc;

        if (!(tax in acc)) acc = { ...acc, [tax]: [] };

        acc[tax].push(term);
        return acc;
      }
    }, {}) ?? {};

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();

    setHighlight(null);
  }, [router.asPath, cultureMap]);

  useEffect(() => {
    if (typeof window !== "undefined" && highlight && cultureMap) {
      cultureMap.setInitallyFitToBounds(false);
      cultureMap.setHighlights([highlight]);
      cultureMap.panTo(highlight.lng, highlight.lat, true);
    }

    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [highlight, cultureMap]);

  useEffect(() => {
    if (event && settings) {
      if (
        event?.locations?.length &&
        event?.locations[0]?.lat &&
        event?.locations[0]?.lng
      ) {
        const { color } = getLocationColors(event?.locations[0], settings);
        setHighlight({
          id: event?.locations[0].id,
          lng: event?.locations[0].lng,
          lat: event?.locations[0].lat,
          title: event?.locations[0].title,
          slug: event?.locations[0].slug,
          color,
        });
      }
    }
  }, [event, setHighlight, settings]);

  let multipleUpcommingDates = [];
  if (event?.dates?.length > 0) {
    if (event?.dates?.length > 1) {
      try {
        const begin = new Date(event.firstEventDate);
        const end = new Date(event.lastEventDate);

        if (new Date() < begin) {
          dateInfo = `${t(
            "event.label.dateFrom",
            "From"
          )} ${begin.toLocaleDateString(
            i18n.language === "de" ? "de-DE" : "en-GB"
          )}`;
        } else {
          dateInfo = `${t(
            "event.label.dateFromVon",
            "From"
          )} ${begin.toLocaleDateString(
            i18n.language === "de" ? "de-DE" : "en-GB"
          )} ${t(
            "event.label.dateUntil",
            "Until"
          ).toLowerCase()} ${end.toLocaleDateString(
            i18n.language === "de" ? "de-DE" : "en-GB"
          )}`;
        }
      } catch (err) {}

      multipleUpcommingDates = event?.dates.reduce((acc: any, date: any) => {
        try {
          const dd = new Date(date.date);
          if (dd >= today) {
            acc.push(
              `${dd.toLocaleDateString(
                i18n.language === "de" ? "de-DE" : "en-GB"
              )} ${getTime(
                date,
                i18n.language === "de" ? "de-DE" : "en-GB",
                true
              )}<br/>`
            );
          }
        } catch (err) {}
        return acc;
      }, []);
    } else {
      try {
        dateInfo = `${new Date(event?.dates[0].date).toLocaleDateString(
          i18n.language === "de" ? "de-DE" : "en-GB"
        )}`;

        timeInfo = getTime(
          event?.dates[0],
          i18n.language === "de" ? "de-DE" : "en-GB",
          true
        );
      } catch (err) {}
    }
  }

  const links: String[] = [];
  if ((event as any)?.socialMedia?.website && (event as any).socialMedia.website.trim()) {
    links.push(event?.socialMedia?.website ?? "");
  }
  if (event?.socialMedia?.facebook && event.socialMedia.facebook.trim()) {
    links.push(event?.socialMedia?.facebook ?? "");
  }
  if (event?.socialMedia?.instagram && event.socialMedia.instagram.trim()) {
    links.push(event?.socialMedia?.instagram ?? "");
  }

  return (
    <MainContent>
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/tour/${getMultilangValue(event?.slug)}`}
        title={`${getMultilangValue(event?.title)} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(event?.metaDesc),
          getMultilangValue(event?.description)
        )}
        og={{
          image: getSeoImage(event?.heroImage),
        }}
      />
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box layerStyle="pageBg">
          <Box layerStyle="page">
            <PageTitle type="high" title={t("event.detail.title", "Event")} />

            <Box color="cm.text">
              {event?.heroImage && event?.heroImage.id && (
                <Box w="100%" mb="3">
                  <Box bg="#333">
                    <ApiImage
                      id={event.heroImage.id}
                      alt={getMultilangValue(event?.heroImage.alt)}
                      meta={event.heroImage.meta}
                      status={event.heroImage.status}
                      useImageAspectRatioPB
                      sizes="(min-width: 45rem) 700px, 100vw"
                      objectFit="cover"
                    />
                  </Box>
                  {event.heroImage.credits !== "" && (
                    <Text textStyle="finePrint" mt="0.5">
                      {t("text.photo.credits", "Photo")}:{" "}
                      <MultiLangValue json={event.heroImage.credits} />
                    </Text>
                  )}
                </Box>
              )}

              <Box mb="2em">
                <chakra.h1 mb="3" textStyle="headline">
                  <MultiLangValue json={event.title} />
                </chakra.h1>
                <Box
                  textStyle="larger"
                  my="1em"
                  py="3"
                  borderColor="cm.accentDark"
                  borderTop="1px solid"
                  borderBottom="1px solid"
                >
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: `${dateInfo} ${timeInfo}`,
                    }}
                  />
                </Box>
                {!isEmptyHtml(
                  getMultilangHtml(event?.description ?? "", true)
                ) && (
                  <MultiLangHtml
                    json={event.description}
                    addMissingTranslationInfo
                  />
                )}
              </Box>

              {links.length > 0 && (
                <Box className="item" mb="1em">
                  <Box
                    mb="0.5em"
                    color="cm.accentDark"
                    textTransform="uppercase"
                    textStyle="categories"
                  >
                    {links.length > 1 ? t("event.label.websites", "Websites") : t("event.label.website", "Website")}
                  </Box>
                  <Box textStyle="card">
                    {links.map((link) => <Box key={link as Key}>
                      <Link
                        target="_blank"
                        rel="no-referral no-follow"
                        href={link as string}
                        display="inline-block"
                        textDecoration="underline"
                        textDecorationColor="cm.accentLight"
                        maxW="100%"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                      >
                        {link}
                      </Link>
                    </Box>)}
                    
                  </Box>
                </Box>
              )}

              <SimpleGrid
                columns={1}
                spacingX="0.5em"
                spacingY="1em"
              >
                {!isEmptyHtml(event?.address ?? "") && (
                  <Box className="item">
                    <Box
                      mb="0.5em"
                      color="cm.accentDark"
                      textTransform="uppercase"
                      textStyle="categories"
                    >
                      {t("event.label.eventLocation", "Event Location")}
                    </Box>
                    <Box textStyle="card">
                      <Box
                        dangerouslySetInnerHTML={{ __html: event?.address }}
                      />
                    </Box>
                  </Box>
                )}
                {!isEmptyHtml(event?.organiser ?? "") && (
                  <Box className="item">
                    <Box
                      mb="0.5em"
                      color="cm.accentDark"
                      textTransform="uppercase"
                      textStyle="categories"
                    >
                      {t("event.label.eventOrganiser", "Event Organiser")}
                    </Box>
                    <Box textStyle="card">
                      <Box
                        dangerouslySetInnerHTML={{ __html: event?.organiser }}
                      />
                    </Box>
                  </Box>
                )}

                {taxonomies?.["eventType"]?.length > 0 && (
                  <Box className="item">
                    <Box
                      mb="0.5em"
                      color="cm.accentDark"
                      textTransform="uppercase"
                      textStyle="categories"
                    >
                      {t("event.label.category", "Category")}
                    </Box>
                    <Box textStyle="card">
                      {taxonomies?.["eventType"]
                        .map((t: any) => {
                          if (!t) return "";

                          return getMultilangValue(t?.name);
                        })
                        .join(", ")}
                    </Box>
                  </Box>
                )}

                {taxonomies?.["accessibility"]?.length > 0 && (
                  // eslint-disable-next-line react/jsx-no-undef
                  <AccessibilityInformation
                    terms={taxonomies?.["accessibility"]}
                  />
                )}
              </SimpleGrid>

              {multipleUpcommingDates?.length > 0 && (
                <Box className="item" mt="1em">
                  <Box
                    mb="0.5em"
                    color="cm.accentDark"
                    textTransform="uppercase"
                    textStyle="categories"
                  >
                    {t("event.label.eventDatesMultiple", "Upcoming dates")}
                  </Box>

                  {multipleUpcommingDates?.length > 10 ? (
                    <Box textStyle="card">
                      <Collapse
                        startingHeight={isMobile ? 100 : 130}
                        in={showDates}
                      >
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: multipleUpcommingDates.join(""),
                          }}
                        />
                      </Collapse>
                      <Link
                        size="sm"
                        onClick={() => setShowDates(!showDates)}
                        pt="1rem"
                        display="inline-block"
                        textDecoration="underline"
                        textDecorationColor="cm.accentLight"
                      >
                        {showDates
                          ? t("button.showLess", "Show less")
                          : t("button.showMore", "Show all")}
                      </Link>
                    </Box>
                  ) : (
                    <Box textStyle="card">
                      <Box
                        dangerouslySetInnerHTML={{
                          __html: multipleUpcommingDates.join(""),
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
              <Box
                pt={{
                  base: "20px",
                  md: "30px",
                  "2xl": "35px",
                }}
              >
                <ShareIcons
                  title={getMultilangValue(event.title)}
                  url={`${config.baseUrl}${
                    i18n.language === "en" ? "/en/event" : "/veranstaltung"
                  }/${getMultilangValue(event.slug)}/`}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box layerStyle="lightGray">
          {event.locations && event.locations.length > 0 && (
            <Box p="20px">
              <PageTitle
                title={t("event.title.location", "Location")}
                type="short"
              />

              {event.locations.map((location: any, i: number) => (
                <CardLocation key={`loc-${location.id}`} location={location} />
              ))}
            </Box>
          )}

          <Footer noBackground />
        </Box>
      </Grid>
    </MainContent>
  );
};

export const ModuleEventGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

export const ModuleEventGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: eventQuery,
    variables: {
      slug: context?.params?.slug,
    },
    ...(context?.preview && accessToken
      ? {
          context: {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {}),
  });

  if (!data?.event)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      event: data?.event,
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 3600,
  };
};
