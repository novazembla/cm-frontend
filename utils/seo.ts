export const getSeoAppTitle = (t: Function) => {
  return `${t("logo.culturemap1", "CULTURE MAP")} ${t(
    "logo.culturemap2",
    "Lichtenberg"
  )}`;
};

export const getSeoImage = (image: any) => {
  if (!image || !image?.id || !image?.meta?.availableSizes) return undefined;

  const originalUrl = image?.meta?.availableSizes.original?.url ?? "";

  if (originalUrl) {
    const largestJPG = Object.keys(image?.meta?.availableSizes).reduce(
      (acc: any, key: any) => {
        if (key === "original") return acc;

        const size = image?.meta?.availableSizes[key];
        if (!size.isJpg) return acc;

        return {
          width: size.width,
          url: size.url,
        };
      },
      {
        width: 0,
        url: undefined,
      }
    );

    return largestJPG.url ?? originalUrl;
  }
  return undefined;
};
