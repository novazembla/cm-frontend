import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { isObject } from "~/utils";

import { gql } from "@apollo/client";
import { getApolloClient } from "~/services";

let currentSettingsInMemory = {};

// create context
const SettingsContext = createContext<any>(currentSettingsInMemory);

const settingsQuery = gql`
  query {
    frontendSettings {
      centerOfGravity
      mapJsonUrl
      taxMapping
      taxonomies {
        id
        name
        slug

        terms {
          id
          name
          slug
          color
          colorDark
        }
      }
    }
  }
`;

const parseSettings = (settings: any) => {
  if (settings && isObject(settings)) {
    return {
      ...settings,
      terms:
        settings?.taxonomies?.length > 0
          ? settings?.taxonomies.reduce((acc: any, tax: any) => {
              if (tax?.terms?.length > 0) {
                return tax?.terms?.reduce((accTerm: any, term: any) => {
                  return {
                    ...accTerm,
                    [term.id]: term,
                  };
                }, acc);
              }

              return acc;
            }, {})
          : {},
    };
  }

  return null;
};

export const useSettingsContext = () => useContext(SettingsContext);

// context provider
export const SettingsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const getSettings = async () => {
      const client = getApolloClient();

      const { data } = await client.query({
        query: settingsQuery,
      });

      if (data?.frontendSettings) {
        setSettings(parseSettings(data?.frontendSettings));
      }
    };

    if (!settings) {
      getSettings();
    }
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
