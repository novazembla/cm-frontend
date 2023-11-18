export const getLocationColors = (location: any, settings: any) => {
  let color, c, colorDark;

  color = colorDark = "#660D36";

  if (location?.primaryTerms?.length > 0) {
    if (settings?.terms && location?.primaryTerms[0].id in settings?.terms) {
      c = settings?.terms[location?.primaryTerms[0].id].color;
      color = !!c ? c : color;

      c = settings?.terms[location?.primaryTerms[0].id].colorDark;
      colorDark = !!c ? c : colorDark;
    }
  } else if (location?.terms?.length > 0) {
    if (settings?.terms && location?.terms[0].id in settings?.terms) {
      c = settings?.terms[location?.terms[0].id].color;
      color = !!c ? c : color;

      c = settings?.terms[location?.terms[0].id].colorDark;
      colorDark = !!c ? c : colorDark;
    }
  }

  return { color, colorDark };
};
