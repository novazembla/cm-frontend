import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import {
  IconButton,
  Box,
  useClipboard,
  Button,
  Flex,
  Textarea,
  Grid,
} from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { PageTitle } from "~/components/ui/PageTitle";
import { useRouter } from "next/router"; 
import { useConfigContext, useMapContext } from "~/provider";
import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useForm, FormProvider } from "react-hook-form";
import { FieldAutocomplete } from "~/components/forms/FieldAutocomplete";
import { SVG } from "~/components/ui/SVG";

export const locationsSearchGQL = gql`
  query locations($where: JSON) {
    locations(
      where: $where
      orderBy: { id: "asc" }
      pageIndex: 0
      pageSize: 50
    ) {
      locations {
        id
        title
      }
      totalCount
    }
  }
`;

export const ModuleComponentLocationEmbedCode = ({
  ...props
}: {
  props?: any;
}) => {
  const { t, i18n } = useAppTranslations();
  const router = useRouter();
  const cultureMap = useMapContext();
  const config = useConfigContext();
  const [locations, setLocations] = useState({});

  const locationLength = Object.keys(locations).length;

  const formMethods = useForm<any>({
    mode: "onTouched",
    defaultValues: {
      s: "",
    },
  });

  const { handleSubmit } = formMethods;
  const onSubmit = async () => {};

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  const src = `${config.baseUrl}/embed/search/ids=${Object.keys(locations).join(
    ","
  )}`;
  const embedcode = `<iframe src="${src}" width="100%" height="300px" style="border:1px solid #ccc;" loading="lazy"></iframe>`;
  const { onCopy } = useClipboard(embedcode);

  return (
    <MainContent layerStyle="lightGray">
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en"
            ? "/en/embed/create/select"
            : "/embed/create/select"
        }`}
        title={`${t(
          "location.embed.title.select",
          "Select locations"
        )} - ${getSeoAppTitle(t)}`}
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
        <Box px="20px" pt="0.5em">
          <PageTitle
            h1
            title={t("location.embed.title.select", "Select locations")}
            type="short"
          />

          <Box
            bg="#fff"
            borderRadius="lg"
            p={{
              base: "20px",
              md: "30px",
              "2xl": "35px",
            }}
          >
            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Box
                  textStyle="larger"
                  fontWeight="bold"
                  pb="1"
                  borderBottom="1px solid"
                  borderColor="cm.accentDark"
                  mb="2"
                >
                  {t(
                    "locations.embed.select.searchForLocations",
                    "Please search and select your locations"
                  )}
                </Box>
                <FieldAutocomplete
                  id="s"
                  name="s"
                  label={t(
                    "locations.embed.select.searchField",
                    "location name"
                  )}
                  searchQueryGQL={locationsSearchGQL}
                  searchQueryDataKey={`locations`}
                  onSelect={(item) =>
                    setLocations({
                      ...locations,
                      [item.id]: item,
                    })
                  }
                  settings={{
                    hideLabel: true,
                  }}
                />
              </form>
            </FormProvider>
          </Box>
          <Box pt="0.5em">
            <PageTitle
              title={t(
                "locations.embed.select.title.selectedLocations",
                "Selected locations"
              )}
              type="short"
            />
            <Box
              bg="#fff"
              borderRadius="lg"
              overflow="hidden"
              p={{
                base: "10px",
                md: "25px",
              }}
            >
              {locationLength > 0 && (
                <Box borderBottom="1px solid" borderColor="cm.accentDark">
                  {Object.keys(locations).map((key: any) => (
                    <Flex
                      w="100%"
                      justifyContent="space-between"
                      fontWeight="bold"
                      lineHeight="48px"
                      borderTop="1px solid"
                      borderColor="cm.accentDark"
                      key={`loc_${key}`}
                    >
                      <Box>{(locations as any)[key]?.label}</Box>
                      <Box display="block">
                        <IconButton
                          aria-label={t(
                            "locations.embed.select.button.removeLocation",
                            "Remove location from list"
                          )}
                          icon={<SVG type="cross" width="60px" height="60px" />}
                          borderRadius="0"
                          p="0"
                          className="svgHover tabbedFocus"
                          paddingInlineStart="0"
                          paddingInlineEnd="0"
                          padding="0"
                          bg="transparent"
                          w="30px"
                          minW="30px"
                          h="30px"
                          transform="translateY(-3px)"
                          overflow="hidden"
                          onClick={() => {
                            const locs:any = {...locations};
                            delete locs[(locations as any)[key]?.id];
                            setLocations(locs)
                          }}
                          transition="all 0.3s"
                          _hover={{
                            bg: "transparent",
                          }}
                          _active={{
                            bg: "transparent",
                          }}
                          _focus={{
                            bg: "transparent",
                            boxShadow: "none",
                          }}
                        />
                      </Box>
                    </Flex>
                  ))}
                </Box>
              )}

              {locationLength === 0 && (
                <Box>
                  {t(
                    "locations.embed.noLocationSelected",
                    "Please select some locations via the search form above"
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Box pt="0.5em">
            <PageTitle
              title={t("locations.embed.title.preview", "Preview")}
              type="short"
            />
            <Box
              bg="#fff"
              borderRadius="lg"
              overflow="hidden"
              p={{
                base: "10px",
                md: "25px",
              }}
            >
              {useMemo(
                () => (
                  <iframe
                    src={src}
                    width="100%"
                    height="300px"
                    style={{
                      border: "1px solid #ccc",
                    }}
                  />
                ),
                [src]
              )}
            </Box>
          </Box>
          <Box pt="0.5em">
            <PageTitle
              title={t("locations.embed.title.embedCode", "Embed code")}
              type="short"
            />
            <Box
              bg="#fff"
              borderRadius="lg"
              overflow="hidden"
              p={{
                base: "10px",
                md: "25px",
              }}
            >
              <Textarea
                w="100%"
                value={embedcode}
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                onChange={() => {}}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
              <Flex mt="20px" justifyContent="flex-end">
                <Button onClick={onCopy} variant="ghost">
                  {t("locations.embed.button.copy", "Copy HTML")}
                </Button>
              </Flex>
            </Box>
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};
