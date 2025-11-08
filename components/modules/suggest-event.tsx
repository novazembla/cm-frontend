import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import NextHeadSeo from "next-head-seo";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import type * as yup from "yup";
import { boolean, mixed, object, string } from "yup";
import {
  convertToHtml,
  getMetaDescriptionContent,
  getMultilangSortedList,
  getSeoAppTitle,
  isEmptyHtml,
} from "~/utils";

import { Box, Button, chakra, Flex, Grid, Text } from "@chakra-ui/react";
import { Footer } from "~/components/app/Footer";
import { MainContent } from "~/components/app/MainContent";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";

import { ImageStatusEnum } from "~/components/ui/ApiImage";
import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { SVG } from "~/components/ui/SVG";

import pick from "lodash/pick";
import { useRouter } from "next/router";
import { FieldCheckboxGroup } from "~/components/forms/FieldCheckboxGroup";
import { FieldImageUploader } from "~/components/forms/FieldImageUploader";
import { FieldInput } from "~/components/forms/FieldInput";
import { FieldRow } from "~/components/forms/FieldRow";
import { FieldSwitch } from "~/components/forms/FieldSwitch";
import { FieldTextArea } from "~/components/forms/FieldTextArea";
import { FormNavigationBlock } from "~/components/forms/FormNavigationBlock";
import { FormScrollInvalidIntoView } from "~/components/forms/FormScrollInvalidIntoView";
import { TextErrorMessage } from "~/components/forms/TextErrorMessage";
import { TwoColFieldRow } from "~/components/forms/TwoColFieldRow";
import { PageTitle } from "~/components/ui/PageTitle";
import {
  useConfigContext,
  useMapContext,
  useSettingsContext,
} from "~/provider";
import { SuggestEventDates } from "./suggest-event-dates";
import { slugify } from "~/utils/slugify";

export const EventSuggestionSchema = object().shape({
  title: string().required(),
  description: string().max(2000).required(),
  address: string(),
  organiser: string(),
  isFree: boolean(),
  // t("suggestion.ticketFee.required", "Please state the admission costs for the event")
  ticketFee: mixed().when("isFree", {
    is: (value: any) => !!!value,
    then: string()
      .required("suggestion.ticketFee.required").max(100),
    otherwise: string(),
  }),
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
  facebook: string().url(),
  instagram: string().url(),
  website: string().url(),
  suggestionSubmittersName: string().required(),
  suggestionSubmittersEmail: string().email().required(),
  suggestionSubmittersPhone: string(),
  suggestionComments: string(),

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

export const eventCreateMutationGQL = gql`
  mutation eventSuggestion($data: EventSuggestionInput!) {
    eventSuggestion(data: $data) {
      id
    }
  }
`;

export const ModuleComponentSuggestEvent = () => {
  const { t, i18n, getMultilangValue } = useAppTranslations();

  const config = useConfigContext();

  const { isMobile } = useIsBreakPoint();

  const [hasFormError, setHasFormError] = useState(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false);
  const [activeUploadCounter, setActiveUploadCounter] = useState(0);

  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    EventSuggestionSchema
  );

  const settings = useSettingsContext();

  const router = useRouter();
  const cultureMap = useMapContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  const [mutation] = useMutation(eventCreateMutationGQL);

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const { fields, remove, insert } = useFieldArray({
    control: formMethods.control,
    name: "dates",
    keyName: "fieldId",
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isDirty }
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

      let terms: string[] = [];

      if (settings?.taxonomies?.typeOfInstitution?.terms) {
        terms = ["eventType", "accessibility"].reduce(
          (accTerms: any[], tax: any) => {
            return [
              ...accTerms,
              ...(Array.isArray(newData?.[tax])
                ? (newData[tax] as string[]).map((id: string) => ({
                    id: parseInt(id),
                  }))
                : []),
            ];
          },
          []
        );
      }

      const now = new Date().getTime();

      const result: any = await mutation({
        variables: {
          data: {
            title: {
              de: newData.title,
              en: newData.title,
            },
            slug: {
              de: `${slugify(newData.title)}-${now}`,
              en: `${slugify(newData.title)}-en-${now}`,
            },
            description: {
              de: convertToHtml(newData.description),
              en: "",
            },
            address: newData?.address ?? "",
            organiser: newData?.organiser ?? "",
            isFree: !!newData?.isFree,
            ticketFee: newData?.ticketFee ?? "",
            dates: {
              create: newData.dates,
            },
            socialMedia: {
              ...pick(newData, [
                "facebook",
                "instagram",
                "website"
              ]),
            },
            meta: {
              ...pick(newData, [
                "facebook",
                "instagram",
                "website",
                "suggestionSubmittersName",
                "suggestionSubmittersEmail",
                "suggestionSubmittersPhone",
                "suggestionComments",
              ]),
              isSuggestion: true,
              suggestionTandC: !!newData.suggestionTandC,
              suggestionIsOwner: !!newData.suggestionIsOwner,
              suggestionImageRightsConfirmation:
                !!newData.suggestionSubmittersImageRightsConfirmation,
            },
            terms: {
              connect: terms,
            },
            ...heroImage,
          },
        },
      });

      if (!result?.errors && result?.data?.eventSuggestion?.id) {
        setSuccessfullySubmitted(true);
        setTimeout(() => {
          window?.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }, 100);
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  const [activeTermsEventType, setActiveTermsEventType] = useState([]);
  const [activeTermsAccessibility, setActiveTermsAccessibility] = useState([]);

  useEffect(() => {
    let resetVars = {};
    if (settings?.taxonomies) {
      if (settings?.taxonomies?.eventType?.terms) {
        setActiveTermsEventType(settings?.taxonomies?.eventType?.terms);

        if (settings?.taxonomies?.typeOfInstitution?.terms?.length) {
          resetVars = {
            ...resetVars,
            eventType: [],
          };
        }
      }

      if (settings?.taxonomies?.accessibility?.terms) {
        setActiveTermsAccessibility(settings?.taxonomies?.accessibility?.terms);

        if (settings?.taxonomies?.accessibility?.terms?.length) {
          resetVars = {
            ...resetVars,
            accessibility: [],
          };
        }
      }

      reset({
        resetVars,
        dates: [
          {
            date: new Date(),
            begin: new Date(new Date().setHours(10, 0, 0, 0)),
            end: new Date(new Date().setHours(18, 0, 0, 0)),
          },
        ],
      });
    }
  }, [settings?.taxonomies, reset]);

  const heroImage = watch("heroImage");
  const suggestionSubmittersImageRightsConfirmation = watch(
    "suggestionSubmittersImageRightsConfirmation"
  );

  const isFree = watch("isFree");
  // t("eventSuggestion.writeErrorEvent", "We could unfortunately not save your suggestion at the moment. Please try again later.")
  return (
    <MainContent isDrawer>
      <NextHeadSeo
        canonical={`${config.baseUrl}/veranstaltung-vorschlagen`}
        title={`${t(
          "eventSuggestion.title",
          "Suggest an event"
        )} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(settings?.suggestionsMetaDesc),
          getMultilangValue(settings?.suggestionsIntroEvent)
        )}
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
            <PageTitle
              h1
              type="high"
              title={t("eventSuggestion.title", "Suggest an event")}
            />

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
                        fill
                        wrapped width={70} height={70}
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
                    "eventSuggestion.successfullySubmittedEvent",
                    "Thank you! Your suggestion has been successfully submitted"
                  )}
                </Box>
                <Box mb="1em" textAlign="center">
                  {t(
                    "eventSuggestion.successfullySubmittedEventReviewInformation",
                    "We will review it manually and put your suggestion online as fast as possible"
                  )}
                </Box>
              </Box>
            ) : (
              <>
                {!isEmptyHtml(
                  getMultilangValue(settings?.suggestionsIntroEvent)
                ) && (
                  <Box
                    textStyle="larger"
                    mt="1em"
                    mb={isMobile ? "2em" : "3em"}
                    fontWeight="bold"
                  >
                    <MultiLangHtml json={settings?.suggestionsIntroEvent} />
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
                      <TextErrorMessage error="eventSuggestion.writeErrorEvent" />
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
                          "eventSuggestion.section.about.title",
                          "About the event"
                        )}
                      </chakra.h2>
                      <Text textStyle="formOptions" mb="1em">
                        {t(
                          "eventSuggestion.section.about.description",
                          "Please tell us something about the suggested event."
                        )}
                      </Text>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="title"
                          id="title"
                          label={t(
                            "eventSuggestion.field.label.title",
                            "Event Title"
                          )}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.title",
                              "Please enter the name of the suggested event"
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldTextArea
                          name="description"
                          id="description"
                          label={t(
                            "eventSuggestion.field.label.description",
                            "Description"
                          )}
                          isRequired={true}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.description",
                              "Please describe the event briefly"
                            ),

                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldTextArea
                          name="organiser"
                          id="organiser"
                          label={t(
                            "eventSuggestion.field.label.organiser",
                            "Organiser"
                          )}
                          isRequired={false}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.organiser",
                              "Who organises the event"
                            ),
                          }}
                        />
                      </FieldRow>
                      <FieldRow>
                        <FieldTextArea
                          name="address"
                          id="address"
                          label={t(
                            "eventSuggestion.field.label.address",
                            "Address"
                          )}
                          isRequired={false}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.address",
                              "Where takes the event place"
                            ),
                          }}
                        />
                      </FieldRow>
                      <Flex mt="4" _first={{ mt: 0 }} w="100%" flexWrap="wrap">
                        <Box w="100%" fontSize="smaller">
                          {t(
                            "eventSuggestion.field.isFree.title",
                            "Participation fee"
                          )}
                        </Box>
                        <FieldSwitch
                          name="isFree"
                          label={
                            <span>
                              {t(
                                "eventSuggestion.field.isFree.toggleLabel",
                                "The event is free"
                              )}
                            </span>
                          }
                          defaultChecked={false}
                        />
                      </Flex>

                      {!isFree && <FieldRow>
                        <FieldInput
                          name="ticketFee"
                          id="ticketFee"
                          type="text"
                          label={t(
                            "eventSuggestion.field.label.ticketFee",
                            "Admission Cost"
                          )}
                          isRequired={!isFree}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.ticketFee",
                              "8 - 12 Euro"
                            ),
                          }}
                        />
                      </FieldRow>}
                    </Box>

                    <Box
                      mb="2em"
                      pt="0.5em"
                      borderTop="1px solid"
                      borderColor="cm.accentDark"
                    >
                      <chakra.h2 textStyle="formOptions" mb="2px">
                        {t(
                          "eventSuggestion.section.dates.title",
                          "Event Dates"
                        )}
                      </chakra.h2>
                      <SuggestEventDates />
                    </Box>

                    <Box
                      mb="1.5em"
                      pt="0.5em"
                      borderTop="1px solid"
                      borderColor="cm.accentDark"
                    >
                      <chakra.h2 textStyle="formOptions" mb="2px">
                        {t(
                          "eventSuggestion.section.taxonomies.title",
                          "The event is ..."
                        )}
                      </chakra.h2>
                      <Text textStyle="formOptions" mb="1em">
                        {t(
                          "eventSuggestion.section.taxonomies.description",
                          "Please indicate the attributes under the event should be found in the search."
                        )}
                      </Text>

                      {activeTermsEventType?.length > 0 && (
                        <FieldRow>
                          <Box>
                            <chakra.h3 textStyle="formOptions" mb="2px">
                              {t(
                                "eventSuggestion.tax.title.eventType",
                                "Type of event"
                              )}
                            </chakra.h3>
                            <FieldCheckboxGroup
                              id="eventType"
                              name="eventType"
                              isRequired={false}
                              label={t(
                                "eventSuggestion.tax.title.eventType",
                                "Type of event"
                              )}
                              type="checkbox"
                              options={getMultilangSortedList(
                                activeTermsEventType.map((term: any) => ({
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

                      {activeTermsAccessibility?.length > 0 && (
                        <FieldRow>
                          <Box>
                            <chakra.h3 textStyle="formOptions" mb="2px">
                              {t(
                                "eventSuggestion.tax.title.accessibility",
                                "Accessibility Information"
                              )}
                            </chakra.h3>
                            <FieldCheckboxGroup
                              id="accessibility"
                              name="accessibility"
                              isRequired={false}
                              label={t(
                                "eventSuggestion.tax.title.accessibility",
                                "Accessibility Information"
                              )}
                              type="checkbox"
                              options={getMultilangSortedList(
                                activeTermsAccessibility.map((term: any) => ({
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
                          "eventSuggestion.section.online.title",
                          "Website(s)"
                        )}
                      </chakra.h2>
                      <Text textStyle="formOptions" mb="1em">
                        {t(
                          "eventSuggestion.section.online.description",
                          "Can the event be found online?"
                        )}
                      </Text>
                      <FieldRow>
                        <FieldInput
                          type="text"
                          name="website"
                          id="website"
                          label={t(
                            "eventSuggestion.field.label.website",
                            "Website"
                          )}
                          settings={{
                            hideLabel: false,
                            placeholder: t(
                              "eventSuggestion.field.placeholder.website",
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
                              "eventSuggestion.field.label.facebook",
                              "Facebook"
                            )}
                            settings={{
                              hideLabel: false,
                              placeholder: t(
                                "eventSuggestion.field.placeholder.website",
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
                              "eventSuggestion.field.label.instagram",
                              "Instagram"
                            )}
                            settings={{
                              hideLabel: false,
                              placeholder: t(
                                "eventSuggestion.field.placeholder.website",
                                "https://www.example.com"
                              ),
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
                        {t("suggestion.section.image.title", "Image")}
                      </chakra.h2>
                      <Text textStyle="formOptions" mb="1em">
                        {t(
                          "suggestion.section.image.description",
                          "Would you have an image representing the event at hand?"
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
                                "I confirm that the uploaded image can be used freely on the website"
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
                        <FieldInput
                          type="text"
                          name="suggestionSubmittersPhone"
                          id="suggestionSubmittersPhone"
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
                          <MultiLangHtml
                            json={settings?.suggestionsTandCInfo}
                          />
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
        </Box>
        <Box>
          <Footer />
        </Box>
      </Grid>
    </MainContent>
  );
};
