import React, { useState, useMemo, ChangeEventHandler, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  chakra,
  IconButton,
  Text,
} from "@chakra-ui/react";

import { useAxiosCancelToken } from "~/hooks/useAxiosCancelToken";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { useFormContext } from "react-hook-form";

import { FieldErrorMessage } from "./FieldErrorMessage";
import { flattenErrors } from "./helpers";

import { ApiImage, ApiImageProps } from "~/components/ui/ApiImage";

import { SVG } from "~/components/ui/SVG";

import { useConfigContext } from "~/provider";

const humanFileSize = (
  size: number | undefined,
  decimalPlaces: number = 0
): string => {
  if (!size || size === 0) return "0";
  const i: number = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(decimalPlaces)} ${
    ["B", "KB", "MB", "GB", "TB"][i]
  }`;
};

const baseStyle = {
  boxSizing: "border-box",
  p: "4",
  position: "absolute",
  t: 0,
  l: 0,
  w: "100%",
  h: "100%",
  borderWidth: 1,
  borderColor: "cm.accentLight",
  borderStyle: "solid",
  borderRadius: "md",
  bg: "#fff",
  color: "#333",
  outline: "none",
  transition: "all .24s ease-in-out",
  cursor: "pointer",
  _hover: {
    bg: "#fff",
    boxShadow: "0px 0 3px 3px #E42B20",
  },
};

const activeStyle = {
  bg: "#fff",
  boxShadow: "0px 0 3px 3px #E42B20",
};

const acceptStyle = {
  bg: "green.200",
  color: "#fff !important",
  _hover: {
    bg: "green.200",
  },
};

const rejectStyle = {
  color: "#fff !important",
  bg: "cm.accentLight",
  _hover: {
    bg: "red.400",
  },
};

export interface FieldImageUploaderSettings {
  onChange?: ChangeEventHandler;
  required?: boolean;
  className?: string;
  placeholder?: string;
  imageIdAsFieldValue?: boolean;
  valid?: boolean;
  accept?: string;
  minFileSize?: number; // in bytes 1024 * 1024 = 1MB
  maxFileSize?: number; // in bytes 1024 * 1024 = 1MB
  aspectRatioPB: number; // the aspect ratios padding bottom
  image?: ApiImageProps;
}

export type FieldImageUploaderProgessInfo = {
  loaded: number;
  total: number;
  percent: number;
};

const initialProgressInfo: FieldImageUploaderProgessInfo = {
  loaded: 0,
  total: 0,
  percent: 0,
};

export const FieldImageUploader = ({
  settings,
  id,
  label,
  name,
  isRequired,
  isDisabled,
  onUpload,
  route = "image",
  setActiveUploadCounter,
  shouldSetFormDirtyOnUpload = false,
  objectFit = "contain",
  objectPosition = "center center",
}: {
  settings?: FieldImageUploaderSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  shouldSetFormDirtyOnUpload?: boolean;
  label: string;
  name: string;
  onUpload?: (id?: number) => void;
  setActiveUploadCounter?: Function;
  connectWith?: any;
  route?: string;
  objectFit?: string;
  objectPosition?: string;
}) => {
  const { t } = useAppTranslations();
  const config = useConfigContext();

  const { createNewCancelToken, isCancel, getCancelToken, getCanceler } =
    useAxiosCancelToken();
  const [progressInfo, setProgressInfo] =
    useState<FieldImageUploaderProgessInfo>(initialProgressInfo);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const [uploadedImgId, setUploadedImgId] = useState();
  const [imageIsDeleted, setImageIsDeleted] = useState(false);

  const [showFileDropError, setShowFileDropError] = useState(false);
  const [fileDropError, setFileDropError] = useState("");

  const {
    formState: { errors },
    register,
    setValue,
    clearErrors,
  } = useFormContext();

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxSize: settings?.maxFileSize ?? 1024 * 1024 * 2,
    minSize: settings?.minFileSize ?? undefined,
    disabled: isDisabled,
    multiple: false,
    accept: settings?.accept ?? "image/*",
    onDropRejected: async (files) => {
      const file = files.shift();

      if (!file || file.errors.length === 0) return;

      setShowFileDropError(true);
      setFileDropError(file.errors[0].code);
    },
    onDropAccepted: async (files) => {
      try {
        setIsUploading(true);
        setIsUploadError(false);

        const formData = new FormData();
        formData.append("image", files[0]);

        const cancelToken = createNewCancelToken();

        if (setActiveUploadCounter)
          setActiveUploadCounter((state: number) => state + 1);

        await axios
          .request({
            method: "post",
            url: `${config.apiUrl}/${route}`,
            cancelToken,
            withCredentials: true,
            data: formData,
            onUploadProgress: (ev) => {
              if (getCancelToken()) {
                setProgressInfo({
                  loaded: ev.loaded ?? 0,
                  total: ev.total ?? 0,
                  percent: ev.total
                    ? Math.round((ev.loaded ?? 0 / ev.total) * 100)
                    : 0,
                });
              }
            },
          })
          .then(({ data }: { data: any }) => {
            if (getCancelToken()) {
              setIsUploading(false);
              setImageIsDeleted(false);

              if (setActiveUploadCounter)
                setActiveUploadCounter((state: number) => state - 1);

              if (data?.id) {
                clearErrors(name);
                setUploadedImgId(data?.id ?? undefined);
                setValue(name, data?.id, {
                  shouldDirty: shouldSetFormDirtyOnUpload,
                });
                if (typeof onUpload === "function")
                  onUpload.call(this, data?.id);
              }
            }
          })
          .catch((error) => {
            if (setActiveUploadCounter)
              setActiveUploadCounter((state: number) => state - 1);

            if (isCancel(error)) return;

            if (getCancelToken()) {
              setIsUploading(false);
              setProgressInfo(initialProgressInfo);
              setIsUploadError(true);
            }
          });
      } catch (err) {
        console.error(err);
      }
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? { activeStyle } : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject || showFileDropError ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept, showFileDropError]
  );

  let currentImage: any =
    settings?.image && settings?.image?.id ? settings.image : {};

  if (imageIsDeleted) currentImage = {};

  const showImage = (currentImage && currentImage?.id) || !!uploadedImgId;

  const hasMin = settings?.minFileSize && settings?.minFileSize > 0;
  const hasMax = settings?.maxFileSize && settings?.maxFileSize > 0;
  let fileSizeInfo = "";

  if (hasMin && hasMax) {
    fileSizeInfo = t(
      "imageuploader.filesizebetween",
      "Size between {{minFileSize}} and {{maxFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
        minFileSize: humanFileSize(settings?.minFileSize, 1),
      }
    );
  } else if (hasMax) {
    fileSizeInfo = t(
      "imageuploader.filesizebelow",
      "Size max. {{maxFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
      }
    );
  } else if (hasMin) {
    fileSizeInfo = t(
      "imageuploader.filesizeabove",
      "Size min. {{minFileSize}}",
      {
        maxFileSize: humanFileSize(settings?.maxFileSize, 1),
        minFileSize: humanFileSize(settings?.minFileSize, 1),
      }
    );
  }

  useEffect(() => {
    if (fileDropError === "") return;

    const timeout = setTimeout(() => {
      setFileDropError("");
      setShowFileDropError(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [fileDropError, setFileDropError, setShowFileDropError]);

  let fileDropErrorMessage = "";

  switch (fileDropError) {
    case "file-too-large":
      fileDropErrorMessage = t(
        "imageuploader.droperror.toolarge",
        "Chosen file is too large"
      );
      break;
    case "file-too-small":
      fileDropErrorMessage = t(
        "imageuploader.droperror.toosmall",
        "Chosen file is too small"
      );
      break;
    case "file-invalid-type":
      fileDropErrorMessage = t(
        "imageuploader.droperror.invalidtype",
        "Type of chosen file is not accepted"
      );
      break;
  }

  const flattenedErrors = flattenErrors(errors);

  return (
    <>
      <FormControl
        id={id}
        isInvalid={flattenedErrors[name]?.message || isDragReject}
        {...{ isRequired, isDisabled }}
      >
        <FormLabel htmlFor={`${id}_dropzone`} mb="0.5">
          {label}
        </FormLabel>

        {showImage && (
          <Box position="relative">
            <ApiImage
              id={uploadedImgId ?? currentImage?.id ?? undefined}
              status={currentImage?.status ?? 0}
              meta={currentImage?.meta}
              forceAspectRatioPB={settings?.image?.forceAspectRatioPB}
              showPlaceholder={settings?.image?.showPlaceholder}
              alt={settings?.image?.alt ?? ""}
              sizes={settings?.image?.sizes}
              objectFit={objectFit}
              objectPosition={objectPosition}
            />
          </Box>
        )}

        {!showImage && (
          <>
            <input
              name={`${name}_dropzone`}
              id={`${name}_dropzone`}
              {...getInputProps()}
            />

            <Box
              position="relative"
              pb={`${settings?.aspectRatioPB ?? 66.66}%`}
              h="0"
              w="100%"
            >
              <Flex
                {...getRootProps({ className: "dropzone" })}
                justifyContent="center"
                textAlign="center"
                alignItems="center"
                flexDirection="column"
                sx={style}
              >
                {(!isUploading || progressInfo.total < 0.01) && (
                  <>
                    {showFileDropError && (
                      <Text color="white" fontWeight="bold">
                        {fileDropErrorMessage}
                      </Text>
                    )}
                    {!showFileDropError && (
                      <Text w="90%">
                        {t(
                          "imageuploader.pleasedroporclick",
                          "Drag & drop an image here, or click to select one"
                        )}
                      </Text>
                    )}

                    {fileSizeInfo && <Text fontSize="sm">{fileSizeInfo}</Text>}
                  </>
                )}

                {isUploading && progressInfo.total > 0.01 && (
                  <>
                    <chakra.span fontSize="md">
                      {t("imageuploader.uploading", "Uploading")}
                      <br />
                      <chakra.span fontSize="xl">
                        {`${Math.round(
                          (progressInfo.loaded / progressInfo.total) * 100
                        )}`}
                        %
                      </chakra.span>
                    </chakra.span>

                    <IconButton
                      position="absolute"
                      top="3"
                      right="3"
                      fontSize="2xl"
                      width="40px"
                      height="40px"
                      icon={<SVG type="cross" width="60px" height="60px" />}
                      color="cm.accentLight"
                      bg="transparent"
                      borderColor="transparent"
                      _hover={{
                        color: "cm.accentDark",
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const canceler = getCanceler();
                        if (typeof canceler === "function") canceler();
                        setIsUploading(false);
                      }}
                      aria-label={t(
                        "imageuploader.cancelupload",
                        "Cancel upload"
                      )}
                      title={t("imageuploader.cancelupload", "Cancel upload")}
                      className="svgHover tabbedFocus"
                      _focus={{
                        bg: "transparent",
                        boxShadow: "none",
                      }}
                    />
                  </>
                )}
              </Flex>
            </Box>
          </>
        )}
        {isUploadError && (
          <Text fontSize="sm" mt="0.5" color="red.500">
            {t(
              "imageuploader.error",
              "Unfortunately, we could not finish you upload please try again later"
            )}
          </Text>
        )}

        <input
          {...{ valid: !flattenedErrors[name]?.message ? "valid" : undefined }}
          type="hidden"
          aria-hidden="true"
          defaultValue={currentImage?.id}
          {...register(name, {
            required: isRequired,
          })}
        />

        <FieldErrorMessage error={flattenedErrors[name]?.message} />
      </FormControl>
    </>
  );
};

export default FieldImageUploader;
