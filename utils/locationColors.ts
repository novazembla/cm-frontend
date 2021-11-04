export const getLocationColors = (location: any, settings: any) => {
  let color, colorDark;

  if (location?.primaryTerms?.length > 0) {
    if (settings?.terms && location?.primaryTerms[0].id in settings?.terms) {
      color = settings?.terms[location?.primaryTerms[0].id].color ?? color;

      colorDark =
        settings?.terms[location?.primaryTerms[0].id].colorDark ??
        settings?.terms[location?.primaryTerms[0].id].color ??
        color;
    }
  } else if (location?.terms?.length > 0) {
    if (settings?.terms && location?.terms[0].id in settings?.terms) {
      color = settings?.terms[location?.terms[0].id].color ?? color;

      colorDark =
        settings?.terms[location?.terms[0].id].colorDark ??
        settings?.terms[location?.terms[0].id].color ??
        color;
    }
  }

  return { color, colorDark };
};
