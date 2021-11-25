import { useState, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";
import { boolean, object, mixed, number, string } from "yup";
import {
  getMultilangSortedList,
  isEmptyHtml,
  convertToHtml,
  getSeoAppTitle,
} from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useMutation, gql } from "@apollo/client";

import { Box, chakra, Grid, Text, Button } from "@chakra-ui/react";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { SVG } from "~/components/ui/SVG";
import { ImageStatusEnum } from "~/components/ui/ApiImage";

import { FieldCheckboxGroup } from "~/components/forms/FieldCheckboxGroup";
import { FieldInput } from "~/components/forms/FieldInput";
import { FieldTextArea } from "~/components/forms/FieldTextArea";
import { FieldSwitch } from "~/components/forms/FieldSwitch";
import { FieldRow } from "~/components/forms/FieldRow";
import { TwoColFieldRow } from "~/components/forms/TwoColFieldRow";
import { TextErrorMessage } from "~/components/forms/TextErrorMessage";
import { FormScrollInvalidIntoView } from "~/components/forms/FormScrollInvalidIntoView";
import { FormNavigationBlock } from "~/components/forms/FormNavigationBlock";
import { FieldImageUploader } from "~/components/forms/FieldImageUploader";
import {
  useSettingsContext,
  useMapContext,
  useConfigContext,
} from "~/provider";
import pick from "lodash/pick";
import { useRouter } from "next/router";
import { PageTitle } from "~/components/ui/PageTitle";

export const SuggestionSchema = object().shape({
  title: string().required(),
  description: string().required(),
  street1: string().required(),
  houseNumber: string().required(),
  // t("validation.error.postcode", "Please provide a valid postcode")
  postCode: number().typeError("validation.postcode").required(),
  city: string().required(),
  phone1: string(),
  alt: mixed().when("heroImage", {
    is: (value: any) => value && !isNaN(value) && value > 0,
    then: string().required(),
    otherwise: string(),
  }),
  credits: mixed().when("heroImage", {
    is: (value: any) => value && !isNaN(value) && value > 0,
    then: string().required(),
    otherwise: string(),
  }),
  email1: string().email(),
  facebook: string().url(),
  twitter: string().url(),
  instagram: string().url(),
  youtube: string().url(),
  website: string().url(),
  suggestionSubmittersName: string().required(),
  suggestionSubmittersEmail: string().email().required(),

  // t("suggestion.imageConfirmation.required", "Please confirm that the image can be published on our website")
  suggestionSubmittersImageRightsConfirmation: mixed().when("heroImage", {
    is: (value: any) => value && !isNaN(value) && value > 0,
    then: boolean()
      .required("suggestion.imageConfirmation.required")
      .oneOf([true], "suggestion.imageConfirmation.required"),
    otherwise: boolean(),
  }),

  // t("suggestion.tAndC.required", "Please confirm our terms and conditions")
  suggestionTandC: boolean()
    .required("suggestion.tAndC.required")
    .oneOf([true], "suggestion.tAndC.required"),
});

export const locationCreateMutationGQL = gql`
  mutation suggestion($data: LocationSuggestionInput!) {
    suggestion(data: $data) {
      id
    }
  }
`;

export const ModuleComponentSuggest = () => {
  const { t, i18n, getMultilangValue } = useAppTranslations();

  const config = useConfigContext();

  const { isMobile } = useIsBreakPoint();

  const [hasFormError, setHasFormError] = useState(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState(0);

  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(SuggestionSchema);

  const settings = useSettingsContext();

  const router = useRouter();
  const cultureMap = useMapContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  const [mutation] = useMutation(locationCreateMutationGQL);

  // useEffect(() => {
  //   if (settings?.taxonomies?.typeOfInstitution?.terms) {
  //     const keysToI = settings?.taxonomies?.typeOfInstitution?.terms?.reduce(
  //       (acc: any, t: any) => {
  //         if (t._count?.locations > 0)
  //           return [...acc, `typeOfInstitution_${t.id}`];
  //         return acc;
  //       },
  //       []
  //     );

  //     const keysTA = settings?.taxonomies?.targetAudience?.terms?.reduce(
  //       (acc: any, t: any) => {
  //         if (t._count?.locations > 0)
  //           return [...acc, `targetAudience_${t.id}`];
  //         return acc;
  //       },
  //       []
  //     );

  //     const keysToO = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
  //       (acc: any, t: any) => {
  //         if (t._count?.locations > 0)
  //           return [...acc, `typeOfOrganisation_${t.id}`];
  //         return acc;
  //       },
  //       []
  //     );

  //     setExtendedValidationSchema(
  //       SuggestionSchema.concat(
  //         object().shape({
  //           ...(keysToI?.length > 0
  //             ? {
  //                 typeOfInstitution: mixed().when(keysToI, {
  //                   is: (...args: any[]) => {
  //                     return !!args.find((a) => a);
  //                   },
  //                   then: boolean(),
  //                   otherwise: number()
  //                     .typeError("validation.array.minOneItem")
  //                     .required(),
  //                 }),
  //               }
  //             : {}),
  //           ...(keysTA?.length > 0
  //             ? {
  //                 targetAudience: mixed().when(keysTA, {
  //                   is: (...args: any[]) => {
  //                     return !!args.find((a) => a);
  //                   },
  //                   then: boolean(),
  //                   otherwise: number()
  //                     .typeError("validation.array.minOneItem")
  //                     .required(),
  //                 }),
  //               }
  //             : {}),
  //           ...(keysToO?.length > 0
  //             ? {
  //                 typeOfOrganisation: mixed().when(keysToO, {
  //                   is: (...args: any[]) => {
  //                     return !!args.find((a) => a);
  //                   },
  //                   then: boolean(),
  //                   otherwise: number()
  //                     .typeError("validation.array.minOneItem")
  //                     .required(),
  //                 }),
  //               }
  //             : {}),
  //         })
  //       )
  //     );
  //   }
  // }, [settings]);

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);
    try {
      const heroImage =
        newData.heroImage && !isNaN(newData.heroImage) && newData.heroImage > 0
          ? {
              heroImage: {
                connect: {
                  id: newData.heroImage,
                },
                update: {
                  cropPosition: 0,
                  [`alt_${i18n.language}`]: newData.alt,
                  [`alt_${i18n.language === "en" ? "de" : "en"}`]: newData.alt,
                  [`credits_${i18n.language}`]: newData.credits,
                  [`credits_${i18n.language === "en" ? "de" : "en"}`]:
                    newData.credits,
                },
              },
            }
          : undefined;

      let terms = [];

      if (settings?.taxonomies?.typeOfInstitution?.terms) {
        terms = [
          "typeOfInstitution",
          "targetAudience",
          "typeOfOrganisation",
        ].reduce((accTerms: any[], tax: any) => {
          return [
            ...accTerms,
            ...settings?.taxonomies?.[tax]?.terms?.reduce(
              (acc: any, t: any) => {
                if (newData[`${tax}_${t.id}`]) return [...acc, { id: t.id }];
                return acc;
              },
              []
            ),
          ];
        }, []);
      }

      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-") // Replace spaces with -
          .replace(/[^\w-]+/g, "") // Remove all non-word chars
          .replace(/--+/g, "-") // Replace multiple - with single -
          .replace(/^-+/, "") // Trim - from start of text
          .replace(/-+$/, ""); // Trim - from end of text
      };

      const now = new Date().getTime();

      const result: any = await mutation({
        variables: {
          data: {
            title: {
              [i18n.language]: newData.title,
              [i18n.language === "en" ? "de" : "en"]: newData.title,
            },
            slug: {
              [i18n.language]: `${slugify(newData.title)}-${now}`,
              [i18n.language === "en" ? "de" : "en"]: `${slugify(
                newData.title
              )}-${i18n.language === "en" ? "de" : "en"}-${now}`,
            },
            description: {
              [i18n.language]: convertToHtml(newData.description),
              [i18n.language === "en" ? "de" : "en"]: convertToHtml(
                newData.description_other
              ),
            },
            terms: {
              connect: terms,
            },
            address: {
              co: "",
              street2: "",
              postCode: newData.postCode ? `${newData.postCode}` : "",
              ...pick(newData, ["street1", "houseNumber", "city"]),
            },
            contactInfo: {
              email2: "",
              phone2: "",
              ...pick(newData, ["email1", "phone1"]),
            },
            socialMedia: pick(newData, [
              "facebook",
              "twitter",
              "instagram",
              "youtube",
              "website",
            ]),
            meta: {
              ...pick(newData, [
                "suggestionSubmittersName",
                "suggestionSubmittersEmail",
                "suggestionComments",
              ]),
              suggestionTandC: !!newData.suggestionTandC,
              suggestionIsOwner: !!newData.suggestionIsOwner,
              suggestionImageRightsConfirmation:
                !!newData.suggestionSubmittersImageRightsConfirmation,
            },
            ...heroImage,
          },
        },
      });

      if (!result?.errors && result?.data?.suggestion?.id) {
        setSuccessfullySubmitted(true);
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  const [activeTermsToI, setActiveTermsToI] = useState([]);
  const [activeTermsToO, setActiveTermsToO] = useState([]);
  const [activeTermsTA, setActiveTermsTA] = useState([]);

  useEffect(() => {
    let resetVars = {};
    if (settings?.taxonomies) {
      if (settings?.taxonomies?.typeOfInstitution?.terms) {
        setActiveTermsToI(settings?.taxonomies?.typeOfInstitution?.terms);

        if (settings?.taxonomies?.typeOfInstitution?.terms?.length) {
          resetVars = {
            ...resetVars,
            ...settings?.taxonomies?.typeOfInstitution?.terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`typeOfInstitution_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
      }
      if (settings?.taxonomies?.typeOfOrganisation?.terms) {
        setActiveTermsToO(settings?.taxonomies?.typeOfOrganisation?.terms);

        if (settings?.taxonomies?.typeOfOrganisation?.terms?.length) {
          resetVars = {
            ...resetVars,
            ...settings?.taxonomies?.typeOfOrganisation?.terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`typeOfOrganisation_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
      }
      if (settings?.taxonomies?.targetAudience?.terms) {
        setActiveTermsTA(settings?.taxonomies?.targetAudience?.terms);

        if (settings?.taxonomies?.targetAudience?.terms?.length) {
          resetVars = {
            ...resetVars,
            s: "",
            cluster: true,
            and: false,
            ...settings?.taxonomies?.targetAudience?.terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`targetAudience_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
      }

      reset(resetVars);
    }
  }, [settings?.taxonomies, reset]);

  const heroImage = watch("heroImage");
  const suggestionSubmittersImageRightsConfirmation = watch(
    "suggestionSubmittersImageRightsConfirmation"
  );
  // t("suggestion.writeError", "We could unfortunately not save your suggestion at the moment. Please try again later.")
  return (
    <MainContent isDrawer layerStyle="pageBg">
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en"
            ? "/en/suggest-a-location"
            : "/kartenpunktvorschlag"
        }`}
        title={`${t("suggest.title", "Suggest a location")} - ${getSeoAppTitle(
          t
        )}`}
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
        <Box layerStyle="page">
          <PageTitle h1 type="high" title={t("suggest.title", "Suggest a location")} />

          {successfullySubmitted ? (
            <Box>
              <Box>
                <Box
                  border="1px solid"
                  borderColor="cm.accentDark"
                  my="3em"
                  w="70px"
                  h="70px"
                  borderRadius="100px"
                  mx="auto"
                >
                  <Box>
                    <SVG
                      type="ok"
                      width="70px"
                      height="70px"
                      className="svg-dark"
                    />
                  </Box>
                </Box>
              </Box>
              <Box
                textStyle="larger"
                fontWeight="bold"
                mb="1em"
                textAlign="center"
              >
                {t(
                  "suggestion.successfullySubmitted",
                  "Thank you! Your suggestion has been successfully submitted"
                )}
              </Box>
              <Box mb="1em" textAlign="center">
                {t(
                  "suggestion.successfullySubmittedReviewInfor",
                  "We will review it manually and put your suggestion online as fast as possible"
                )}
              </Box>
            </Box>
          ) : (
            <>
              {!isEmptyHtml(getMultilangValue(settings?.suggestionsIntro)) && (
                <Box textStyle="larger" mt="1em" mb={isMobile ? "2em" : "3em"} fontWeight="bold">
                  <MultiLangHtml json={settings?.suggestionsIntro} />
                </Box>
              )}
              <FormProvider {...formMethods}>
                <FormNavigationBlock
                  shouldBlock={isDirty || activeUploadCounter > 0}
                />
                <FormScrollInvalidIntoView hasFormError={hasFormError} />

                {hasFormError && (
                  <Box
                    mt="1em"
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <TextErrorMessage error="suggestion.writeError" />
                  </Box>
                )}

                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t(
                        "suggestion.section.about.title",
                        "About the location"
                      )}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.about.description",
                        "Please tell us something about the suggested location."
                      )}
                    </Text>
                    <FieldRow>
                      <FieldInput
                        type="text"
                        name="title"
                        id="title"
                        label={t(
                          "suggestion.field.label.title",
                          "Name of location"
                        )}
                        isRequired={true}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.title",
                            "Please enter the name of the suggested location"
                          ),
                        }}
                      />
                    </FieldRow>
                    <FieldRow>
                      <FieldTextArea
                        name="description"
                        id="description"
                        label={
                          i18n.language === "en"
                            ? t(
                                "suggestion.field.label.mandatoryDescriptionInEnglish",
                                "Description in English"
                              )
                            : t(
                                "suggestion.field.label.mandatoryDescriptionInGerman",
                                "Description in German"
                              )
                        }
                        isRequired={true}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.description",
                            "Please describe the location briefly"
                          ),
                        }}
                      />
                    </FieldRow>
                    <FieldRow>
                      <FieldTextArea
                        name="description_other"
                        id="description_other"
                        label={
                          i18n.language === "en"
                            ? t(
                                "suggestion.field.label.otherLanguageDescriptionInGerman",
                                "Description in German"
                              )
                            : t(
                                "suggestion.field.label.otherLanguageDescriptionInEnglish",
                                "Description in English"
                              )
                        }
                        isRequired={false}
                        settings={{
                          hideLabel: false,
                          placeholder:
                            i18n.language === "en"
                              ? t(
                                  "suggestion.field.placeholder.otherLanguageDescriptionInGerman",
                                  "If you can please describe the location in German too"
                                )
                              : t(
                                  "suggestion.field.placeholder.otherLanguageDescriptionInEnglish",
                                  "If you can please describe the location in English too"
                                ),
                        }}
                      />
                    </FieldRow>
                  </Box>

                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t("suggestion.section.address.title", "Address")}
                    </chakra.h2>

                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.address.description",
                        "Please enter the address of the location. We will use this information to place the location on the map"
                      )}
                    </Text>
                    <TwoColFieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="street1"
                          id="street1"
                          label={t("suggestion.field.label.street", "Street")}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.street1",
                              "Siegfriedstr."
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="houseNumber"
                          id="houseNumber"
                          label={t(
                            "suggestion.field.label.houseNumber",
                            "House number"
                          )}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.houseNumber",
                              "11"
                            ),
                          }}
                        />
                      </FieldRow>
                    </TwoColFieldRow>
                    <TwoColFieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="postCode"
                          id="postCode"
                          label={t(
                            "suggestion.field.label.postcode",
                            "Post code"
                          )}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.postcode",
                              "12345"
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="city"
                          id="city"
                          label={t("suggestion.field.label.city", "City")}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            defaultValue: "Berlin",
                          }}
                        />
                      </FieldRow>
                    </TwoColFieldRow>
                  </Box>
                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t(
                        "suggestion.section.contact.title",
                        "Contact information"
                      )}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.contact.description",
                        "How can people contact the location? This information will be listed on our website."
                      )}
                    </Text>
                    <FieldRow>
                      <FieldInput
                        type="text"
                        name="phone"
                        id="phone"
                        label={t(
                          "suggestion.field.label.phone",
                          "Phone number"
                        )}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.phone",
                            "030/1234567"
                          ),
                        }}
                      />
                    </FieldRow>
                    <FieldRow>
                      <FieldInput
                        type="text"
                        name="email1"
                        id="email1"
                        label={t(
                          "suggestion.field.label.email",
                          "Email address"
                        )}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.email",
                            "Your email address"
                          ),
                        }}
                      />
                    </FieldRow>
                  </Box>
                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t("suggestion.section.image.title", "Image")}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.image.description",
                        "Would you have an image of the location at hand? TODO: better text"
                      )}
                    </Text>
                    <FieldRow>
                      <FieldSwitch
                        name="suggestionSubmittersImageRightsConfirmation"
                        isRequired={!!heroImage}
                        label={
                          <span>
                            {t(
                              "suggestion.field.label.suggestionSubmittersImageRightsConfirmation",
                              "I confirm that the uploaded image can be used freely on the website TODO:"
                            )}
                          </span>
                        }
                        defaultChecked={false}
                      />
                    </FieldRow>
                    {(suggestionSubmittersImageRightsConfirmation ||
                      !!heroImage) && (
                      <>
                        <FieldRow>
                          <FieldImageUploader
                            name="heroImage"
                            id="heroImage"
                            label={t("suggestion.field.label.image", "Image")}
                            isRequired={!!settings.imageRequired}
                            route="suggestionImage"
                            objectFit="contain"
                            objectPosition="left center"
                            setActiveUploadCounter={setActiveUploadCounter}
                            settings={{
                              minFileSize:
                                settings?.minFileSize ?? 1024 * 1024 * 0.0977,
                              maxFileSize:
                                settings?.maxFileSize ?? 1024 * 1024 * 3,
                              aspectRatioPB: 25, // % bottom padding

                              image: {
                                status: ImageStatusEnum.READY,
                                id: undefined,
                                meta: undefined,
                                alt: "",
                                forceAspectRatioPB: 25,
                                showPlaceholder: true,
                                sizes:
                                  settings?.sizes ??
                                  "(min-width: 45em) 800px, 95vw",
                              },
                            }}
                          />
                        </FieldRow>
                        <FieldRow>
                          <FieldInput
                            type="text"
                            name="alt"
                            id="alt"
                            label={t(
                              "suggestion.field.label.alt",
                              "Image description"
                            )}
                            isRequired={!!heroImage}
                            isDisabled={!!!heroImage}
                            settings={{
                              hideLabel: false,
                              placeholder: t(
                                "suggestion.field.placeholder.alt",
                                "Short description of the image"
                              ),
                            }}
                          />
                        </FieldRow>
                        <FieldRow>
                          <FieldInput
                            type="text"
                            name="credits"
                            id="credits"
                            label={t(
                              "suggestion.field.label.credits",
                              "Image credits"
                            )}
                            isRequired={!!heroImage}
                            isDisabled={!!!heroImage}
                            settings={{
                              hideLabel: false,
                              placeholder: t(
                                "suggestion.field.placeholder.credits",
                                "The image credits"
                              ),
                            }}
                          />
                        </FieldRow>
                      </>
                    )}
                  </Box>
                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t("suggestion.section.online.title", "Website(s)")}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.online.description",
                        "Can the location be found online?"
                      )}
                    </Text>
                    <FieldRow>
                      <FieldInput
                        type="text"
                        name="website"
                        id="website"
                        label={t("suggestion.field.label.website", "Website")}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.website",
                            "https://www.example.com"
                          ),
                        }}
                      />
                    </FieldRow>
                    <TwoColFieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="facebook"
                          id="facebook"
                          label={t(
                            "suggestion.field.label.facebook",
                            "Facebook"
                          )}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.website",
                              "https://www.example.com"
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="instagram"
                          id="instagram"
                          label={t(
                            "suggestion.field.label.instagram",
                            "Instagram"
                          )}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.website",
                              "https://www.example.com"
                            ),
                          }}
                        />
                      </FieldRow>
                    </TwoColFieldRow>
                    <TwoColFieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="twitter"
                          id="twitter"
                          label={t("suggestion.field.label.twitter", "Twitter")}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.website",
                              "https://www.example.com"
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="youtube"
                          id="youtube"
                          label={t("suggestion.field.label.youtube", "Youtube")}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "suggestion.field.placeholder.website",
                              "https://www.example.com"
                            ),
                          }}
                        />
                      </FieldRow>
                    </TwoColFieldRow>
                  </Box>

                  <Box
                    mb="1.5em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t(
                        "suggestion.section.taxonomies.title",
                        "The location is ..."
                      )}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.taxonomies.description",
                        "Please indicate the attributes under the location should be found in the search."
                      )}
                    </Text>

                    {activeTermsToI?.length > 0 && (
                      <FieldRow>
                        <Box>
                          <chakra.h3 textStyle="formOptions" mb="2px">
                            {t(
                              "suggestion.tax.title.typeOfInstitution",
                              "Type of institution"
                            )}
                          </chakra.h3>
                          <FieldCheckboxGroup
                            id="typeOfInstitution"
                            name="typeOfInstitution"
                            isRequired={false}
                            label={t(
                              "suggestion.tax.title.typeOfInstitution",
                              "Type of institution"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsToI.map((term: any) => ({
                                label: term.name,
                                id: term.id,
                              })),
                              "label",
                              getMultilangValue
                            )}
                          />
                        </Box>
                      </FieldRow>
                    )}
                    {activeTermsTA?.length > 0 && (
                      <FieldRow>
                        <Box>
                          <chakra.h3 textStyle="formOptions" mb="2px">
                            {t(
                              "suggestion.tax.title.targetAudience",
                              "Target audience"
                            )}
                          </chakra.h3>
                          <FieldCheckboxGroup
                            id="targetAudience"
                            name="targetAudience"
                            isRequired={false}
                            label={t(
                              "suggestion.tax.title.targetAudience",
                              "Target audience"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsTA.map((term: any) => ({
                                label: term.name,
                                id: term.id,
                              })),
                              "label",
                              getMultilangValue
                            )}
                          />
                        </Box>
                      </FieldRow>
                    )}
                    {activeTermsToO?.length > 0 && (
                      <FieldRow>
                        <Box>
                          <chakra.h3 textStyle="formOptions" mb="2px">
                            {t(
                              "suggestion.tax.title.typeOfOrganisation",
                              "Type of organisation"
                            )}
                          </chakra.h3>
                          <FieldCheckboxGroup
                            id="typeOfOrganisation"
                            name="typeOfOrganisation"
                            isRequired={false}
                            label={t(
                              "suggestion.tax.title.typeOfOrganisation",
                              "Type of organisation"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsToO.map((term: any) => ({
                                label: term.name,
                                id: term.id,
                              })),
                              "label",
                              getMultilangValue
                            )}
                          />
                        </Box>
                      </FieldRow>
                    )}
                  </Box>
                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <chakra.h2 textStyle="formOptions" mb="2px">
                      {t(
                        "suggestion.section.suggestor.title",
                        "About yourself"
                      )}
                    </chakra.h2>
                    <Text textStyle="formOptions" mb="1em">
                      {t(
                        "suggestion.section.suggestor.description",
                        "In case we have further questions please give us your name and email address. We will keep this information private."
                      )}
                    </Text>

                    <FieldRow>
                      <FieldInput
                        type="text"
                        name="suggestionSubmittersName"
                        id="suggestionSubmittersName"
                        label={t(
                          "suggestion.field.label.suggestionSubmittersName",
                          "Your name"
                        )}
                        isRequired={true}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.suggestionSubmittersName",
                            "Please enter your name"
                          ),
                        }}
                      />
                    </FieldRow>
                    <FieldRow>
                      <FieldInput
                        type="email"
                        name="suggestionSubmittersEmail"
                        id="suggestionSubmittersEmail"
                        label={t(
                          "suggestion.field.label.suggestionSubmittersEmail",
                          "Your email address"
                        )}
                        isRequired={true}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.suggestionSubmittersEmail",
                            "Please enter your email address"
                          ),
                        }}
                      />
                    </FieldRow>

                    <FieldRow>
                      <FieldTextArea
                        name="suggestionComments"
                        id="suggestionComments"
                        label={t(
                          "suggestion.field.label.comments",
                          "Further comments"
                        )}
                        settings={{
                          hideLabel: false,
                          placeholder: t(
                            "suggestion.field.placeholder.comments",
                            "Do you have any other notes or comments?"
                          ),
                        }}
                      />
                    </FieldRow>
                  </Box>

                  <Box
                    mb="2em"
                    pt="0.5em"
                    borderTop="1px solid"
                    borderColor="cm.accentDark"
                  >
                    <Box textStyle="formOptions" mb="1em">
                      {!isEmptyHtml(
                        getMultilangValue(settings?.suggestionsTandCInfo)
                      ) && (
                        <MultiLangHtml json={settings?.suggestionsTandCInfo} />
                      )}
                    </Box>
                    <FieldRow>
                      <FieldSwitch
                        name="suggestionTandC"
                        isRequired={true}
                        label={
                          <span>
                            {t(
                              "suggestion.field.label.suggestionSubmittersTandCAcceptance",
                              "I accept the terms and conditions"
                            )}
                          </span>
                        }
                        defaultChecked={false}
                      />
                    </FieldRow>
                    <FieldRow>
                      <FieldSwitch
                        name="suggestionIsOwner"
                        label={
                          <span>
                            {t(
                              "suggestion.field.label.ownerOfLocation",
                              "I am legally responsible for the location"
                            )}
                          </span>
                        }
                        defaultChecked={false}
                      />
                    </FieldRow>
                    <FieldRow>
                      <Box textAlign="right" mt="2em" w="100%">
                        <Button type="submit" variant="ghost">
                          {t("suggestion.button.submit", "Submit suggestion")}
                        </Button>
                      </Box>
                    </FieldRow>
                  </Box>
                </form>
              </FormProvider>
            </>
          )}
        </Box>
        <Footer />
      </Grid>
    </MainContent>
  );
};
