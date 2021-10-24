import { gql, useQuery } from "@apollo/client";
import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { Footer } from "~/components/app";
import { getApolloClient } from "~/services";
import {
  Box,
  chakra,
  Heading,
  LinkBox,
  LinkOverlay,
  Flex,
} from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "~/utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import i18n from "i18next";
import { NextPageContext } from "next";
import Arrow from "~/assets/svg/Pfeil_quer.svg";

export const Event = ({ children: event }: { children: any }) => {
  const { t, i18n } = useTranslation();

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
              {begin.toLocaleDateString(i18n.language === "de" ? "de-DE":"en-GB")}
            </>
          );
        } else {
          dateInfo = (
            <>
              {t("event.label.dateUntil", "Until")}{" "}
              {end.toLocaleDateString(i18n.language === "de" ? "de-DE":"en-GB")}
            </>
          );
        }
      } catch (err) {}
    } else {
      try {
        dateInfo = `${new Date(event.firstEventDate).toLocaleDateString(
          i18n.language === "de" ? "de-DE":"en-GB"
        )}`;

        const begin = new Date(event?.dates[0].begin);
        const end = new Date(event?.dates[0].end);
        timeInfo = `${begin.toLocaleTimeString(i18n.language === "de" ? "de-DE":"en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}${i18n.language === "de" ? " UHR" : ""}`;
      } catch (err) {}
    }
  }

  return (
    <LinkBox
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
              href={`/${
                i18n.language === "de" ? "veranstaltung" : "event"
              }/${getMultilangValue(event?.slug)}`}
            >
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
          {event?.terms?.length > 0 ? (
            event.terms
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
            <Arrow width="30px" height="20px" />
          </Box>
        </Flex>
      </Flex>
    </LinkBox>
  );
};
