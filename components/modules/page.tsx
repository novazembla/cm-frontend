import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { ApiImage } from "~/components/ui/ApiImage";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { getApolloClient } from "~/services";
import {
  Box,
  Text,
  chakra,
  Grid,
  Flex,
  VStack,
  Button,
} from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  useConfigContext,
  useMapContext,
  useSettingsContext,
} from "~/provider";
import { useRouter } from "next/router";
import {
  getMetaDescriptionContent,
  getSeoAppTitle,
  getSeoImage,
} from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQueryPartial } from "~/graphql";

export const pageQuery = gql`
  query ($slug: String!) {
    ${settingsQueryPartial}
    page(slug: $slug) {
      id
      title
      slug
      intro
      content
      metaDesc
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

export const ModuleComponentPage = ({ page }: { page: any }) => {
  const router = useRouter();
  const cultureMap = useMapContext();
  const config = useConfigContext();
  const settings = useSettingsContext();

  const { getMultilangValue, i18n, t } = useAppTranslations();

  const [typesOfOrganisation, setTypesOfOrganisation] = useState<any[]>([]);
  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  useEffect(() => {
    if (settings?.taxonomies?.typeOfInstitution?.terms?.length) {
      setTypesOfOrganisation(
        settings?.taxonomies?.typeOfInstitution?.terms
          .sort((t1: any, t2: any) => {
            if (getMultilangValue(t1.name) < getMultilangValue(t2.name))
              return -1;
            if (getMultilangValue(t1.name) > getMultilangValue(t2.name))
              return 1;
            return 0;
          })
          .map((type: any) => {
            return `
          <div style="display:flex;align-items:center;margin: 0.2em 0;">
            <div style="width: 20px; height: 20px; border-radius: 20px; transform: translateY(-1px); background: ${
              type.color
            }; margin-right: 0.35em"></div>
            ${getMultilangValue(type.name)}
          </div>
        
        `;
          })
      );
    }
  }, [settings, getMultilangValue]);

  console.log(page);

  return (
    <MainContent isDrawer>
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/${getMultilangValue(page?.slug)}`}
        title={`${getMultilangValue(page?.title)} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(page?.metaDesc),
          getMultilangValue(page?.intro)
        )}
        og={{
          image: getSeoImage(page?.heroImage),
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
            <PageTitle h1 type="high" title={getMultilangValue(page.title)} />

            <Box color="cm.text" w="100%">
              {page.heroImage && page.heroImage.id && (
                <Box w="100%" mt="1em" mb="3em" position="relative">
                  <Box bg="#333">
                    <ApiImage
                      id={page.heroImage.id}
                      useImageAspectRatioPB
                      alt={getMultilangValue(page?.heroImage.alt)}
                      meta={page.heroImage.meta}
                      status={page.heroImage.status}
                      sizes="(min-width: 45rem) 700px, 100vw"
                    />
                  </Box>
                  {page.heroImage.credits && (
                    <Text fontSize="xs" mt="0.5" color="cm.text">
                      {t("text.photo.credits", "Photo")}:{" "}
                      <MultiLangValue json={page.heroImage.credits} />
                    </Text>
                  )}
                </Box>
              )}
              {page.intro && (
                <Box textStyle="larger" mb="3em" fontWeight="bold">
                  <MultiLangHtml json={page.intro} addMissingTranslationInfo />
                </Box>
              )}

              <MultiLangHtml
                json={page.content}
                addMissingTranslationInfo
                replace={[
                  {
                    key: "[list-type-of-institutions]",
                    value: typesOfOrganisation.join(""),
                  },
                ]}
              />

              {page?.slug?.de === "inhalte-vorschlagen" && (
                <VStack marginTop="6" alignItems="flex-start" gap="2">
                  <Button
                    onClick={() => {
                      router.push(`/ort-vorschlagen`);
                    }}
                    variant="ghost"
                    minW="160px"
                  >
                    {t(
                      "suggestContent.button.suggestLocation",
                      "Ort vorschlagen"
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      router.push(`/veranstaltung-vorschlagen`);
                    }}
                    variant="ghost"
                    minW="160px"
                  >
                    {t(
                      "suggestContent.button.suggestLocation",
                      "Veranstaltung vorschlagen"
                    )}
                  </Button>
                </VStack>
              )}
            </Box>
          </Box>
        </Box>
        <Box>
          <Footer />
        </Box>
      </Grid>
    </MainContent>
  );
};

export const ModulePageGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

export const ModulePageGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: pageQuery,
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

  if (!data?.page)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      page: data?.page,
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 3600,
  };
};
