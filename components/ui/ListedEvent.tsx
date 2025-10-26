import { MultiLangValue } from "~/components/ui/MultiLangValue";
import NextLink from "next/link";
import { Box, chakra, LinkBox, LinkOverlay, Flex } from "@chakra-ui/react";

import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { SVG } from "~/components/ui/SVG";
import { useSettingsContext } from "~/provider";

export const ListedEvent = ({ event }: { event: any }) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const settings = useSettingsContext();
  const { isMobile } = useIsBreakPoint();

  let dateInfo: any = t("event.missingData.eventDate", "TBD");
  let timeInfo: any = "";

  if (event?.dates?.length) {
    if (event?.dates?.length > 1) {
      try {
        const begin = new Date(event.firstEventDate);
        const end = new Date(event.lastEventDate);

        if (new Date() < begin) {
          dateInfo = (
            <>
              {t("event.label.dateFrom", "From")}{" "}
              {begin.toLocaleDateString(
                i18n.language === "de" ? "de-DE" : "en-GB"
              )}
            </>
          );
        } else {
          dateInfo = (
            <>
              {t("event.label.dateFromVon", "From")}{" "}
              {begin.toLocaleDateString(
                i18n.language === "de" ? "de-DE" : "en-GB"
              )}
              {
                isMobile ? <>
                  <chakra.span textTransform="lowercase"> {t("event.label.dateUntil", "Until")} </chakra.span>
                </> : 
                <>
                  <br/>{t("event.label.dateUntil", "Until")}
                </>
              }{end.toLocaleDateString(
                i18n.language === "de" ? "de-DE" : "en-GB"
              )}
            </>
          );
        }
      } catch (err) {}
    } else {
      try {
        dateInfo = `${new Date(event.firstEventDate).toLocaleDateString(
          i18n.language === "de" ? "de-DE" : "en-GB"
        )}`;

        const begin = new Date(event?.dates[0].begin);
        timeInfo = `${begin.toLocaleTimeString(
          i18n.language === "de" ? "de-DE" : "en-GB",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}${i18n.language === "de" ? " UHR" : ""}`;
      } catch (err) {}
    }
  }

  const eventTermIds = settings?.taxonomies?.eventType?.terms?.map((term: any) => term.id) ?? [];

  const terms = event?.terms?.filter((term: any) => eventTermIds.includes(term.id))

  return isMobile ? 
    <ContentMobile dateInfo={dateInfo} timeInfo={timeInfo} event={event} terms={terms}/> :
    <ContentTablet dateInfo={dateInfo} timeInfo={timeInfo} event={event} terms={terms}/>

};

function ContentTablet({
  dateInfo,
  timeInfo,
  event,
  terms
}) {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  
  return <LinkBox
      as="article"
      mb="1em"
      pb="1em"
      borderBottom="1px solid"
      borderColor="cm.accentDark"
      _last={{
        border: "none",
      }}
    >
      <Flex mb="1em">
        <Box w="33.33%" textStyle="card">
          {dateInfo}
          <br />
          {timeInfo}
        </Box>
        <Box w="66.66%">
          <chakra.h2 className="headline" color="cm.text">
            <LinkOverlay
              as={NextLink}
              href={`${i18n.language === "en" ? "/en" : ""}/${
                i18n.language === "de" ? "veranstaltung" : "event"
              }/${getMultilangValue(event?.slug)}`}
              textDecoration="none" textStyle="headline">
              <MultiLangValue json={event?.title} />
            </LinkOverlay>
          </chakra.h2>
        </Box>
      </Flex>
      <Flex
        mb="0.5em"
        color="cm.accentDark"
        textTransform="uppercase"
        textStyle="categories"
      >
        <Box w="33.33%" textStyle="">
          {t("event.label.category", "Category")}
        </Box>
        <Box w="66.66%" textStyle="">
          {t("event.label.eventLocation", "Event Location")}
        </Box>
      </Flex>
      <Flex textStyle="card">
        <Box w="33.33%" pr="3">
          {terms?.length > 0 ? (
            terms
              .map((t: any) => {
                if (!t) return "";

                return getMultilangValue(t?.name);
              })
              .join(", ")
          ) : (
            <></>
          )}
        </Box>
        <Flex w="66.66%">
          <Box w="calc(100% - 30px)">
            {event?.address ? (
              <Box dangerouslySetInnerHTML={{ __html: event?.address }} />
            ) : (
              <>{t("event.missingData.eventLocation", "TBD")}</>
            )}
          </Box>
          <Box alignSelf="flex-end">
            <SVG
              type="arrow-right"
              width={40}
              height={22}
            />
          </Box>
        </Flex>
      </Flex>
    </LinkBox>
}

function ContentMobile({
  dateInfo,
  timeInfo,
  event,
  terms
}) {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  
  return <LinkBox
      as="article"
      mb="1em"
      pb="1em"
      borderBottom="1px solid"
      borderColor="cm.accentDark"
      _last={{
        border: "none",
      }}
    > 
      <Box textStyle="card" pb="0.5em">
        {dateInfo} {timeInfo}
      </Box>
      <Box mb="1em">
        <chakra.h2 className="headline" color="cm.text">
          <LinkOverlay
            as={NextLink}
            href={`${i18n.language === "en" ? "/en" : ""}/${
              i18n.language === "de" ? "veranstaltung" : "event"
            }/${getMultilangValue(event?.slug)}`}
            textDecoration="none" textStyle="headline">
            <MultiLangValue json={event?.title} />
          </LinkOverlay>
        </chakra.h2>
      </Box>
      <Box
        mb="0.5em"
        color="cm.accentDark"
        textTransform="uppercase"
        textStyle="categories"
      >
        {t("event.label.category", "Category")}
      </Box>
      <Box mb="1em">
        {terms?.length > 0 ? (
            terms
              .map((t: any) => {
                if (!t) return "";

                return getMultilangValue(t?.name);
              })
              .join(", ")
          ) : (
            <></>
          )}
      </Box>
      <Flex
        mb="0.5em"
        color="cm.accentDark"
        textTransform="uppercase"
        textStyle="categories"
      >
        <Box w="66.66%" textStyle="">
          {t("event.label.eventLocation", "Event Location")}
        </Box>
      </Flex>
      <Flex>
        <Box w="calc(100% - 30px)">
          {event?.address ? (
            <Box dangerouslySetInnerHTML={{ __html: event?.address }} />
          ) : (
            <>{t("event.missingData.eventLocation", "TBD")}</>
          )}
        </Box>
        <Box alignSelf="flex-end">
          <SVG
            type="arrow-right"
            width={30}
            height={17}
          />
        </Box>
      </Flex>
    </LinkBox>
}