import React from "react";
import { Box, Flex, chakra } from "@chakra-ui/react";

import { useImageStatusPoll } from "~/hooks/useImageStatusPoll";
import { useAppTranslations } from "~/hooks/useAppTranslations";

export type ApiConfigImageFormatType = "square" | "normal";

export type ApiImageMetaInformation = {
  uploadFolder: string;
  originalFileName: string;
  originalFileUrl: string;
  originalFilePath: string;
  imageType: ApiConfigImageFormatType;
  mimeType: any;
  encoding: any;
  size: number;
  availableSizes?: Record<
    string,
    {
      width: number;
      height: number;
      url: string;
      isJpg: boolean;
      isWebP: boolean;
    }
  >;
};

export enum ImageStatusEnum {
  UPLOADED,
  PROCESSING,
  FAILEDRETRY,
  ERROR,
  READY,
  TRASHED,
  DELETED,
}

export enum ImageCropPosition {
  CENTER, // 0
  TOP, // 1
  RIGHT, // 2
  BOTTOM, // 3
  LEFT, // 4
}

export type ApiImageProps = {
  id: number | undefined;
  alt: string;
  objectFit?: string;
  objectPosition?: string;
  meta?: ApiImageMetaInformation;
  status: ImageStatusEnum;
  cropPosition?: ImageCropPosition;
  forceAspectRatioPB?: number;
  useImageAspectRatioPB?: boolean;
  showPlaceholder?: boolean;
  placeholder?: string;
  sizes?: string;
  imgCssProps?: any;
};

export const ApiImage = ({
  id,
  alt,
  meta,
  status,
  objectFit,
  objectPosition,
  useImageAspectRatioPB,
  forceAspectRatioPB,
  placeholder,
  showPlaceholder,
  cropPosition,
  sizes = "100vw",
  imgCssProps,
}: ApiImageProps) => {
  const { t, getMultilangValue } = useAppTranslations();

  const [polledStatus, polledMeta] = useImageStatusPoll(id, status);

  let content;
  let imageAspectRatioPB;

  let finalObjectPosition = objectPosition ?? "center center";
  
  if (cropPosition) {
    switch (cropPosition) {
      case ImageCropPosition.BOTTOM:
        finalObjectPosition = "center bottom";
        break;

      case ImageCropPosition.TOP:
        finalObjectPosition = "center top";
        break;

      case ImageCropPosition.LEFT:
        finalObjectPosition = "left center";
        break;

      case ImageCropPosition.RIGHT:
        finalObjectPosition = "right center";
        break;
    }
  }

  if (
    status === ImageStatusEnum.READY ||
    polledStatus === ImageStatusEnum.READY
  ) {
    const aSizes =
      meta?.availableSizes ?? polledMeta?.availableSizes ?? undefined;

    if (aSizes) {
      const originalUrl = aSizes.original?.url ?? "";
      const originalWidth = aSizes.original?.width ?? 0;
      const originalHeight = aSizes.original?.height ?? 0;

      if (useImageAspectRatioPB && originalWidth > 0)
        imageAspectRatioPB = ((originalHeight / originalWidth) * 100).toFixed(3);

      const sourceWebp = Object.keys(aSizes).reduce((acc: any, key: any) => {
        const size = aSizes[key];
        if (!size.isWebP) return acc;

        acc.push(`${size.url} ${size.width}w`);
        return acc;
      }, [] as string[]);

      const sourceJpg = Object.keys(aSizes).reduce((acc: any, key: any) => {
        const size = aSizes[key];
        if (!size.isJpg) return acc;

        acc.push(`${size.url} ${size.width}w`);
        return acc;
      }, [] as string[]);

      if (originalUrl) {
        content = (
          <picture>
            {sourceWebp && sourceWebp.length > 0 && (
              <source
                srcSet={sourceWebp.join(",")}
                sizes={sizes}
                type="image/webp"
              />
            )}
            {sourceJpg && sourceJpg.length > 0 && (
              <source
                srcSet={sourceJpg.join(",")}
                sizes={sizes}
                type="image/jpeg"
              />
            )}
            <chakra.img
              objectPosition={
                objectFit && objectFit !== "none" ? finalObjectPosition : "none"
              }
              objectFit={
                objectFit && objectFit !== "none" ? objectFit : ("none" as any)
              }
              src={originalUrl}
              alt={getMultilangValue(alt)}
              width={originalWidth}
              height={originalHeight}
              bg="transparent"
              {...(imgCssProps ? imgCssProps : {})}              
            />
          </picture>
        );
      }
    }
  }

  if ((!content || !id) && showPlaceholder)
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        fontSize="lg"
        color="#333"
        border="1px solid"
        bg="#fff"
        borderColor="cm.accentLight"
        h="100%"
        p="4"
        textAlign="center"
        borderRadius="md"
        display="flex !important"
      >
        {placeholder ?? t("apiimage.uploaded", "Processing image")}
      </Flex>
    );

  if (content && (forceAspectRatioPB || imageAspectRatioPB)) {
    const aPB = forceAspectRatioPB ?? imageAspectRatioPB;
    content = (
      <Box className="aspect" pb={`${aPB}%`}>
        <Box className="ratio">{content}</Box>
      </Box>
    );
  }

  return <>{content}</>;
};
