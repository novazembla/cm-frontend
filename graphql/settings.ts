import { gql } from "@apollo/client";

export const settingsQueryPartial = `
  frontendSettings {
    centerOfGravity
    mapJsonUrl
    taxMapping
    suggestionsIntro
    suggestionsTandCInfo
    taxonomies {
      id
      name
      slug
      terms {
        id
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