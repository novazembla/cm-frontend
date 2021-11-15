import { useState, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";
import { boolean, object, mixed, number, string } from "yup";
import { getMultilangSortedList, isEmptyHtml, convertToHtml } from "~/utils";
import { useMutation, gql } from "@apollo/client";

import { Footer } from "~/components/app";
import { Box, chakra, Grid, Text, Button } from "@chakra-ui/react";
import { MainContent } from "~/components/app";
import { useAppTranslations } from "~/hooks";
import { ErrorMessage, MultiLangHtml } from "~/components/ui";
import {
  FieldCheckboxGroup,
  FieldInput,
  FieldTextArea,
  FieldSwitch,
  FieldRow,
  TwoColFieldRow,
  FormScrollInvalidIntoView,
} from "~/components/forms";
import { useSettingsContext, useMapContext } from "~/provider";
import { pick } from "lodash";
import { useRouter } from "next/router";

export const SuggestionSchema = object().shape({
  title: string().required(),
  description: string().required(),
  street1: string().required(),
  houseNumber: string().required(),
  postCode: number().required(),
  city: string().required(),
  phone1: string(),
  email1: string().email(),
  facebook: string().url(),
  twitter: string().url(),
  instagram: string().url(),
  youtube: string().url(),
  website: string().url(),
  suggestionSubmittersName: string().required(),
  suggestionSubmittersEmail: string().email().required(),
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

  const [hasFormError, setHasFormError] = useState(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(SuggestionSchema);

  const settings = useSettingsContext();

  const router = useRouter();
  const cultureMap = useMapContext();

  useEffect(() => {
    console.log("mount suggest form");

    if (cultureMap) cultureMap.showCurrentView();

  }, [router.asPath, cultureMap]);

  const [mutation, mutationResults] = useMutation(locationCreateMutationGQL);

  useEffect(() => {
    if (settings?.taxonomies?.typeOfInstitutions?.terms) {
      const keysToI = settings?.taxonomies?.typeOfInstitutions?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `typeOfInstitution_${t.id}`];
          return acc;
        },
        []
      );

      const keysTA = settings?.taxonomies?.targetAudience?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `targetAudience_${t.id}`];
          return acc;
        },
        []
      );

      const keysToO = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `typeOfOrganisation_${t.id}`];
          return acc;
        },
        []
      );

      setExtendedValidationSchema(
        SuggestionSchema.concat(
          object().shape({
            ...(keysToI?.length > 0
              ? {
                  typeOfInstitution: mixed().when(keysToI, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
            ...(keysTA?.length > 0
              ? {
                  targetAudience: mixed().when(keysTA, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
            ...(keysToO?.length > 0
              ? {
                  typeOfOrganisation: mixed().when(keysToO, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
          })
        )
      );
    }
  }, [settings]);

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const {
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);
    setIsNavigatingAway(false);
    try {
      // const heroImage =
      //   newData.heroImage &&
      //   !isNaN(newData.heroImage) &&
      //   newData.heroImage > 0
      //     ? {
      //         heroImage: {
      //           connect: {
      //             id: newData.heroImage,
      //           },
      //           update: {
      //             cropPosition: newData.heroImage_cropPosition
      //               ? parseInt(newData.heroImage_cropPosition)
      //               : 0,
      //             ...multiLangImageMetaRHFormDataToJson(
      //               newData,
      //               "heroImage",
      //               ["alt", "credits"],
      //               config.activeLanguages
      //             ),
      //           },
      //         },
      //       }
      //     : undefined;

      // let terms = [];
      // if (Array.isArray(data?.moduleTaxonomies)) {
      //   terms = data?.moduleTaxonomies.reduce((acc: any, module: any) => {
      //     if (Array.isArray(module.terms) && module.terms.length > 0) {
      //       return [
      //         ...acc,
      //         ...mapGroupOptionsToData(
      //           newData,
      //           module.terms,
      //           `tax_${module.id}`
      //         ),
      //       ];
      //     }
      //     return acc;
      //   }, []);
      // }

      // const primaryTerms = mapPrimaryTermsToData(
      //   "set",
      //   newData,
      //   data?.moduleTaxonomies
      // );

      // if (primaryTerms?.primaryTerms?.set) {
      //   terms = primaryTerms?.primaryTerms?.set.reduce(
      //     (acc: any, term: any) => {
      //       if (!acc.find((t: any) => t.id === term.id))
      //         acc.push({
      //           id: term.id,
      //         });
      //       return acc;
      //     },
      //     terms
      //   );
      // }
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

      await mutation({
        variables: {
          data: {
            title: {
              [i18n.language]: newData.title,
              [i18n.language === "en" ? "de" : "en"]: newData.title,
            },
            slug: {
              [i18n.language]: `${slugify(newData.title)}-${now}`,
              [i18n.language === "en" ? "de" : "en"]: `${slugify(newData.title)}-${i18n.language === "en" ? "de" : "en"}-${now}`,
            },
            description: {
              [i18n.language]: convertToHtml(newData.description),
              [i18n.language === "en" ? "de" : "en"]: "",
            },
            terms: {
              connect: [],
            },
            address: {
              co: "",
              street2: "",
              ...pick(newData, ["street1", "houseNumber", "city", "postCode"]),
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
            },
            // ...heroImage,
            // ...fieldImagesRFHFormDataToData(newData),
            // ...filteredOutputByWhitelist(
            //   multiLangRHFormDataToJson(
            //     newData,
            //     multiLangFields,
            //     config.activeLanguages
            //   ),
            //   [],
            //   multiLangFields
            // ),
          },
        },
      });

      if (!mutationResults.error) {
        setSuccessfullySubmitted(true);
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
  const [accordionDefaultIndex, setAccordionDefaultIndex] = useState<
    number[] | null
  >(null);

  useEffect(() => {
    let resetVars = {};
    if (settings?.taxonomies) {
      if (settings?.taxonomies?.typeOfInstitution?.terms) {
        const terms = settings?.taxonomies?.typeOfInstitution?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );
        if (terms?.length) {
          resetVars = {
            ...resetVars,
            ...terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`typeOfInstitution_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
        setActiveTermsToI(terms);
      }
      if (settings?.taxonomies?.typeOfOrganisation?.terms) {
        const terms = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );

        setActiveTermsToO(terms);

        if (terms?.length) {
          resetVars = {
            ...resetVars,
            ...terms.reduce(
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
        const terms = settings?.taxonomies?.targetAudience?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );

        setActiveTermsTA(terms);

        if (terms?.length) {
          resetVars = {
            ...resetVars,
            s: "",
            cluster: true,
            and: false,
            ...terms.reduce(
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

  // TODO: use is navigating away ...
  return (
    <MainContent isDrawer layerStyle="pageBg">
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
          <Box layerStyle="headingPullOut" mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              {t("suggest.title", "Suggest a location")}
            </chakra.h1>
          </Box>

          {!isEmptyHtml(getMultilangValue(settings?.suggestionsIntro)) && (
            <Box textStyle="larger" mt="1em" mb="2em" fontWeight="bold">
              <MultiLangHtml json={settings?.suggestionsIntro} />
            </Box>
          )}
          <FormProvider {...formMethods}>
            <FormScrollInvalidIntoView hasFormError={hasFormError} />
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Box
                mb="2em"
                pt="0.5em"
                borderTop="1px solid"
                borderColor="cm.accentDark"
              >
                <chakra.h2 textStyle="formOptions" mb="2px">
                  {t("suggestion.section.about.title", "About the location")}
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
                    label={t(
                      "suggestion.field.label.description",
                      "Description"
                    )}
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
                      label={t("suggestion.field.label.postcode", "Post code")}
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
                  {t("suggestion.section.contact.title", "Contact information")}
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
                    label={t("suggestion.field.label.phone", "Phone number")}
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
                    label={t("suggestion.field.label.email", "Email address")}
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
                      label={t("suggestion.field.label.facebook", "Facebook")}
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
                      label={t("suggestion.field.label.instagram", "Instagram")}
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
                  {t("suggestion.section.suggestor.title", "About yourself")}
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
                  ) && <MultiLangHtml json={settings?.suggestionsTandCInfo} />}
                </Box>
                <FieldRow>
                  <FieldSwitch
                    name="suggestionTandC"
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
        </Box>
        <Footer />
      </Grid>
    </MainContent>
  );
};
