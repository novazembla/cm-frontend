import { gql } from "@apollo/client";

export const settingsQueryPartial = `
  frontendSettings {
    centerOfGravity
    mapJsonUrl
    taxMapping
    suggestionsIntro
    suggestionsIntroEvent
    quickSearchInfo
    suggestionsMetaDesc
    suggestionsTandCInfo
    defaultMetaDesc
    taxonomies {
      id
      name
      slug
      terms {
        id
        hasReducedVisibility
        iconKey
        name
        slug
        color
        taxonomyId
        colorDark
        _count
      }
    }
  }
`;

export const settingsQuery = gql`
  query {
    ${settingsQueryPartial}
  }
`;