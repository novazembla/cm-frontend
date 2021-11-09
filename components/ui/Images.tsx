import React from "react";
import { Box, AspectRatio, Text, SimpleGrid } from "@chakra-ui/react";
import { MultiLangValue, ApiImage, ImageCropPosition } from "~/components/ui";

export const Images = ({ images }: { images: any }) => {
  if (!images && images?.length === 0) return <></>;

  return (
    <SimpleGrid
      columns={1}
      spacingY="1em"
      px={{
        base: "20px",
        md: "35px",
      }}
      pb={{
        base: "20px",
        md: "35px",
      }}
    >
      {images.map((image: any, index: number) => {
        const isPortrait =
          image?.meta?.availableSizes?.original?.height >
          image?.meta?.availableSizes?.original?.width;

        console.log(image.meta);

        if (!image?.id) return <></>;

        return (
          <Box
            key={`image-${index}`}
            w={isPortrait ? "66.66%" : "100%"}
            h="auto"
          >
            <ApiImage
              id={image.id}
              alt={image.alt}
              meta={image.meta}
              status={image.status}
              sizes="(min-width: 45rem) 700px, 100vw"
              cropPosition={ImageCropPosition.LEFT}
              objectFit="contain"
              useImageAspectRatioPB={true}
            />

            {image.credits !== "" && (
              <Text textStyle="finePrint" mt="0.5">
                <MultiLangValue json={image.credits} />
              </Text>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
