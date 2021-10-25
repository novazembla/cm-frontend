import React from "react";
import Image from "next/image";
import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { BeatLoader } from "react-spinners";

import { useImageStatusPoll } from "~/hooks";
import { getMultilangValue } from "~/utils";

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
  useImageAspectRatioPB,
  forceAspectRatioPB,
  placeholder,
  showPlaceholder,
  cropPosition,
  sizes = "100vw",
}: ApiImageProps) => {
  const { t } = useTranslation();

  const [polledStatus, polledMeta] = useImageStatusPoll(id, status);

  let content;
  let imageAspectRatioPB;

  let objectFit = "center center";
  if (cropPosition) {
    switch (cropPosition) {
      case ImageCropPosition.BOTTOM:
        objectFit = "center bottom";
        break;

      case ImageCropPosition.TOP:
        objectFit = "center top";
        break;

      case ImageCropPosition.LEFT:
        objectFit = "left center";
        break;

      case ImageCropPosition.RIGHT:
        objectFit = "right center";
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
        imageAspectRatioPB = Math.floor(
          (originalHeight / originalWidth) * 100
        );

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
              objectPosition={objectFit}
              src={originalUrl}
              alt={getMultilangValue(alt)}
              width={originalWidth}
              height={originalHeight}
            />
          </picture>
        );
      }
    }
  }

  if (
    !content &&
    (status === ImageStatusEnum.ERROR || polledStatus === ImageStatusEnum.ERROR)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        fontSize="lg"
        color="gray.800"
        border="2px solid"
        bg="red.100"
        borderColor="red.100"
        minH="200px"
        p="4"
        textAlign="center"
      >
        {t(
          "apiimage.errormsg",
          "The image could unfortunately not be processed. Please try uploading again."
        )}
      </Flex>
    );

  if (
    !content &&
    (status === ImageStatusEnum.UPLOADED ||
      status === ImageStatusEnum.PROCESSING ||
      status === ImageStatusEnum.FAILEDRETRY)
  )
    content = (
      <Flex
        justifyContent="center"
        alignItems="center"
        direction="column"
        fontSize="md"
        color="gray.800"
        border="2px solid"
        bg="green.200"
        borderColor="green.200"
        minH="100%"
        p="4"
        textAlign="center"
      >
        <Text pb="4">
          {t(
            "apiimage.processsing",
            "Image successfuly uploaded. We are processing it now"
          )}
        </Text>

        <BeatLoader />
      </Flex>
    );

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