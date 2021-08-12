import { useContext } from "react";
import { ConfigContext } from "~/provider";

export const useConfig = () => {
  return useContext(ConfigContext);
};
