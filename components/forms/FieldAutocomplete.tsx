import { useState, useEffect } from "react";
import { useCombobox } from "downshift";
import { useLazyQuery, DocumentNode } from "@apollo/client";
import debounce from "lodash/debounce";
import { useFormContext } from "react-hook-form";
import { flattenErrors } from "./helpers";
import { usePopper } from "@chakra-ui/popper";

import {
  FormLabel,
  FormControl,
  Box,
  Input,
  chakra,
  VisuallyHidden,
} from "@chakra-ui/react";

import { useAppTranslations } from "~/hooks/useAppTranslations";

export interface FieldAutocompleteItem {
  label: string;
  id: number;
}

export interface FieldAutocompleteSettings {
  placeholder?: string;
  hideLabel?: boolean;
}

export const FieldAutocomplete = ({
  settings,
  item,
  id,
  label,
  name,
  isRequired,
  isDisabled,
  onSelect,
  resultItemToString = (item: any) =>
    item?.label ?? item?.title ?? item?.name ?? item?.id,
  searchQueryGQL,
  searchQueryDataKey,
}: {
  settings?: FieldAutocompleteSettings;
  item?: FieldAutocompleteItem | undefined;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  onSelect: (item: any) => void;
  resultItemToString?: (item: any) => string;
  searchQueryGQL: DocumentNode;
  searchQueryDataKey: string;
}) => {
  const { t, getMultilangValue } = useAppTranslations();
  const { popperRef, referenceRef, update } = usePopper({
    matchWidth: true,
  });

  const [lastSearch, setLastSearch] = useState("");
  const [currentItem, setCurrentItem] = useState<any>();

  const [findItems, { loading, data, error }] = useLazyQuery(searchQueryGQL, {
    fetchPolicy: "no-cache",
  });

  const {
    formState: { errors },
    register,
    watch,
    setValue,
  } = useFormContext();

  const findItemsButChill = debounce((inputValue: string) => {
    if (lastSearch !== inputValue) {
      setLastSearch(inputValue);
      findItems({
        variables: {
          where: {
            fullText: {
              contains: inputValue,
              mode: "insensitive",
            },
          },
        },
      });
    }
  }, 350);

  let searchResult = [];
  if (
    data &&
    searchQueryDataKey in data &&
    searchQueryDataKey in data[searchQueryDataKey] &&
    data[searchQueryDataKey]?.totalCount > 0
  ) {
    searchResult = data[searchQueryDataKey][searchQueryDataKey].map(
      (item: any, index: number) => ({
        id: item.id,
        label: getMultilangValue(item.title),
      })
    );

    searchResult.sort(
      (item: FieldAutocompleteItem, item2: FieldAutocompleteItem) => {
        if (item.label < item2.label) {
          return -1;
        }
        if (item2.label > item.label) {
          return 1;
        }
        return 0;
      }
    );
  }

  const {
    isOpen,
    inputValue,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    highlightedIndex,
    reset,
  } = useCombobox({
    initialSelectedItem: undefined,
    items: searchResult,
    onStateChange: ({ inputValue, type, selectedItem, isOpen }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          if (typeof inputValue === "string" && inputValue.length > 2)
            findItemsButChill(inputValue);

          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (!selectedItem) return;

          onSelect(selectedItem);
          reset();
          break;

        default:
          break;
      }
    },
    itemToString: resultItemToString,
  });

  const flattenedErrors = flattenErrors(errors);

  useEffect(() => {
    if (typeof window !== "undefined")
      // popper is places using the SSR generated code.
      // it needs an update to position correctly on component load
      setTimeout(update, 100);

    // eslint-disable-next-line
  }, []);

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      {settings?.hideLabel ? (
        <VisuallyHidden>
          <FormLabel htmlFor={id} mb="0.5">
            {label}
          </FormLabel>
        </VisuallyHidden>
      ) : (
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>
      )}

      <Box>
        <Box {...getComboboxProps()}>
          <Box ref={referenceRef}>
            <Input
              {...getInputProps()}
              placeholder={settings?.placeholder ?? ""}
            />
          </Box>
          <Box ref={popperRef} zIndex={1000}>
            <chakra.ul
              {...getMenuProps()}
              border={
                isOpen &&
                inputValue &&
                inputValue.length > 2 &&
                (loading || data || error)
                  ? "1px solid"
                  : "none"
              }
              borderRadius="md"
              bg="#fff"
              borderColor="cm.accentLight"
              p="0"
              m="0"
              maxH="310px"
              overflowY="auto"
            >
              {isOpen &&
                inputValue &&
                inputValue.length > 2 &&
                (loading || error || data) && (
                  <>
                    {data &&
                      searchResult &&
                      !loading &&
                      searchResult.map((item: any, index: number) => {
                        return (
                          <chakra.li
                            listStyleType="none"
                            p="1"
                            
                            key={`${item}${index}`}
                            {...getItemProps({ item, index })}
                          >
                            <chakra.span
                              display="block"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              w="100%"
                              whiteSpace="nowrap"
                              borderColor="gray.400"
                              cursor="pointer"
                              h="42px"
                              px="2"
                              borderRadius="md"
                              lineHeight="42px"
                              bg={
                                highlightedIndex === index
                                  ? "gray.200"
                                  : "transparent"
                              }
                            >
                              {item.label}
                            </chakra.span>
                          </chakra.li>
                        );
                      })}

                    {(searchResult?.length === 0 || error) &&
                      !loading &&
                      inputValue.length > 2 && (
                        <chakra.li
                          listStyleType="none"
                          m="1"
                          px="2"
                          borderColor="gray.400"
                          cursor="default"
                          h="42px"
                          borderRadius="md"
                          lineHeight="42px"
                          key={`not-found`}
                        >
                          {t(
                            "forms.select.autocomplete.search.notfound",
                            "Nothing found"
                          )}
                        </chakra.li>
                      )}

                    {loading && (
                      <chakra.li
                        listStyleType="none"
                        m="1"
                        px="2"
                        borderColor="gray.400"
                        cursor="pointer"
                        h="42px"
                        borderRadius="md"
                        lineHeight="42px"
                        key={`not-found`}
                      >
                        {t(
                          "forms.select.autocomplete.search.loading",
                          "Serching the database"
                        )}
                      </chakra.li>
                    )}
                  </>
                )}
            </chakra.ul>
          </Box>
        </Box>
      </Box>
    </FormControl>
  );
};
