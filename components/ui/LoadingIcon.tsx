import { Flex } from "@chakra-ui/react";

import BeatLoader from "react-spinners/BeatLoader";

export const LoadingIcon = ({ my = "3em" }: { my?: string }) => {
  return (
    <Flex my={my} justifyContent="center">
      <BeatLoader color="#333" />
    </Flex>
  );
};
