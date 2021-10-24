import { gql } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  CardLocation,
} from "~/components/ui";
import { Footer } from "~/components/app";
import { getApolloClient } from "~/services";
import { Box, SimpleGrid, Text, chakra, Heading } from "@chakra-ui/react";
import { getMultilangValue, isEmptyHtml } from "~/utils";
import { useTranslation } from "next-i18next";
import { GetStaticPaths, GetStaticProps } from "next";

const eventQuery = gql`
  query ($slug: String!) {
    event(slug: $slug) {
      id
      title
      slug
      address
      organiser
      meta
      isFree
      description
      firstEventDate
      lastEventDate
      terms {
        id
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

    if (begin && !includeEnd) {
      return `${begin.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })}${locale === "de" ? " UHR" : ""}`;
    } else if (begin && includeEnd) {
      const end = new Date(date.end);

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
  const { t, i18n } = useTranslation();

  let dateInfo: any = t("event.missingData.eventDate", "TBD");
  let timeInfo: any = "";

  const today = new Date(new Date().setHours(0, 0, 0, 0));

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
            "event.label.dateUntil",
            "Until"
          )} ${end.toLocaleDateString(
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

  return (
    <>
      <Box layerStyle="page">
        <Box layerStyle="headingPullOut" mb="3">
          <Text className="highlight" color="cm.text">
            {t("event.detail.title", "Event")}
          </Text>
        </Box>

        <Box color="cm.text">
          {event?.heroImage && event?.heroImage.id && (
            <Box w="100%" mb="3">
              <Box bg="#333">
                <ApiImage
                  id={event.heroImage.id}
                  alt={event.heroImage.alt}
                  meta={event.heroImage.meta}
                  status={event.heroImage.status}
                  useImageAspectRatioPB
                  sizes="(min-width: 55rem) 800px, 100vw"
                />
              </Box>
              {event.heroImage.credits !== "" && (
                <Text textStyle="finePrint" mt="0.5">
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
                dangerouslySetInnerHTML={{ __html: `${dateInfo} ${timeInfo}` }}
              />
            </Box>
            {!isEmptyHtml(getMultilangValue(event?.description ?? "")) && (
              <MultiLangHtml json={event.description} />
            )}
          </Box>
          <SimpleGrid columns={2} spacingX="0.5em" spacingY="1em">
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
                  <Box dangerouslySetInnerHTML={{ __html: event?.address }} />
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
                  <Box dangerouslySetInnerHTML={{ __html: event?.organiser }} />
                </Box>
              </Box>
            )}

            {event?.terms?.length > 0 && (
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
                  {event.terms
                    .map((t: any) => {
                      if (!t) return "";

                      return getMultilangValue(t?.name);
                    })
                    .join(", ")}
                </Box>
              </Box>
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
              <Box textStyle="card">
                <Box
                  dangerouslySetInnerHTML={{
                    __html: multipleUpcommingDates.join(""),
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box layerStyle="blurredLightGray">
        {event.locations && event.locations.length > 0 && (
          <Box p="20px">
            <chakra.h3 className="highlight" color="cm.text" pb="1em">
              {t("event.title.location", "Location")}
            </chakra.h3>

            {event.locations.map((location: any, i: number) => (
              <CardLocation key={`loc-${location.id}`} location={location} />
            ))}
          </Box>
        )}

        <Footer noBackground />
      </Box>
    </>
  );
};

export const ModuleEventGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

// This gets called on every request
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
    },
    revalidate: 3600,
  };
};
