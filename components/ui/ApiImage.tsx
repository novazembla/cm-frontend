import React from "react";
import Image from "next/image";
import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";

import { useAppTranslations, useImageStatusPoll } from "~/hooks";

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
  meta?: ApiImageMetaInformation;
  status: ImageStatusEnum;
  cropPosition?: ImageCropPosition;
  forceAspectRatioPB?: number;
  useImageAspectRatioPB?: boolean;
  showPlaceholder?: boolean;
  placeholder?: string;
  sizes?: string;
};

export const ApiImage = ({
  id,
  alt,
  meta,
  status,
  objectFit,
  useImageAspectRatioPB,
  forceAspectRatioPB,
  placeholder,
  showPlaceholder,
  cropPosition,
  sizes = "100vw",
}: ApiImageProps) => {
  const { t, getMultilangValue } = useAppTranslations();

  const [polledStatus, polledMeta] = useImageStatusPoll(id, status);

  let content;
  let imageAspectRatioPB;

  let objectPosition = "center center";
  if (cropPosition) {
    switch (cropPosition) {
      case ImageCropPosition.BOTTOM:
        objectPosition = "center bottom";
        break;

      case ImageCropPosition.TOP:
        objectPosition = "center top";
        break;

      case ImageCropPosition.LEFT:
        objectPosition = "left center";
        break;

      case ImageCropPosition.RIGHT:
        objectPosition = "right center";
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
        imageAspectRatioPB = Math.floor((originalHeight / originalWidth) * 100);

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
                objectFit && objectFit !== "none" ? objectPosition : "none"
              }
              objectFit={
                objectFit && objectFit !== "none" ? objectFit : ("none" as any)
              }
              src={originalUrl}
              alt={getMultilangValue(alt)}
              width={originalWidth}
              height={originalHeight}
              bg="transparent"
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
        color="gray.800"
        border="2px solid"
        bg="gray.100"
        borderColor="gray.100"
        minH="200"
        h="100%"
        p="4"
        textAlign="center"
      >
        {" "}
        {placeholder ?? t("apiimage.placeholder", "Image")}
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
