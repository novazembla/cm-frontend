import { Flex } from "@chakra-ui/react";

import { BeatLoader } from "react-spinners";

export const LoadingIcon = () => {
  return  <Flex my="3em" justifyContent="center"><BeatLoader color="#333"/></Flex>
}
