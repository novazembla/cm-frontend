import { useEffect, useMemo } from "react";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import {
  Box,
  useClipboard,
  Button,
  Flex,
  Textarea,
  Grid,
} from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { FieldRadioGroup } from "~/components/forms/FieldRadioGroup";
import { PageTitle } from "~/components/ui/PageTitle";
import { useRouter } from "next/router";
import { useConfigContext, useMapContext } from "~/provider";
import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useForm, FormProvider } from "react-hook-form";

export const ModuleComponentToursEmbedCode = ({
  tours,
  totalCount,
  ...props
}: {
  tours: any;
  totalCount: number;
  props: any;
}) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const router = useRouter();
  const cultureMap = useMapContext();
  const config = useConfigContext();

  const formMethods = useForm<any>({
    mode: "onTouched",
    defaultValues: {
      tour: tours?.length > 0 ? getMultilangValue(tours[0].slug) : "",
    },
  });

  const { handleSubmit, watch } = formMethods;
  const onSubmit = async () => {};

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  const slug = watch("tour");

  const src = `${config.baseUrl}/embed/tour/${slug}`;
  const embedcode = `<iframe src="${src}" width="100%" height="300px" style="border:1px solid #ccc;" loading="lazy"></iframe>`;
  const { onCopy } = useClipboard(embedcode);

  return (
    <MainContent>
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en"
            ? "/en/embed/create/tour"
            : "/embed/create/tour"
        }`}
        title={`${t("tour.listings.title", "Tours")} - ${getSeoAppTitle(t)}`}
      />
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
        layerStyle="lightGray"
      >
        <Box px="20px" pt="0.5em">
          <PageTitle
            h1
            title={t("tour.listings.title", "Tours")}
            type="short"
          />

          <Box
            bg="#fff"
            borderRadius="lg"
            overflow="hidden"
            p={{
              base: "20px",
              md: "30px",
              "2xl": "35px",
            }}
          >
            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {totalCount > 0 && (
                  <Box
                    textStyle="larger"
                    fontWeight="bold"
                    pb="1"
                    borderBottom="1px solid"
                    borderColor="cm.accentDark"
                    mb="2"
                  >
                    {t("tours.embed.chooseTour", "Please choose a tour")}
                  </Box>
                )}
                {totalCount > 0 && (
                  <FieldRadioGroup
                    id="tour"
                    name="tour"
                    isRequired={true}
                    label={t(
                      "events.filter.title.eventDateRange",
                      "Date range"
                    )}
                    defaultValue={
                      tours?.length > 0 ? getMultilangValue(tours[0].slug) : ""
                    }
                    options={tours.map((tour: any) => ({
                      label: getMultilangValue(tour.title),
                      id: getMultilangValue(tour.slug),
                    }))}
                  />
                )}
              </form>
            </FormProvider>
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
