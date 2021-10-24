export const settingsQueryPartial = `
  frontendSettings {
      centerOfGravity
      mapJsonUrl
      taxMapping
      taxonomies {
        id
        name
        slug

        terms {
          id
          name
          slug
          color
          colorDark
        }
      }
    }`;
