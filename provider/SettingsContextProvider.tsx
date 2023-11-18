import React, { createContext, useContext, useState } from "react";
import { isObject } from "~/utils";

let currentSettingsInMemory = {};

// create context
const SettingsContext = createContext<any>(currentSettingsInMemory);

const parseSettings = (settings: any) => {
  if (settings && isObject(settings)) {
    const result = {
      ...settings,
      taxonomies:
        settings?.taxonomies?.length > 0 && settings?.taxMapping
          ? Object.keys(settings?.taxMapping).reduce((acc, key) => {
              const taxonomy = settings?.taxonomies.find(
                (t: any) =>
                  parseInt(t.id) === parseInt(settings?.taxMapping[key])
              );
              if (taxonomy) {
                return {
                  ...acc,
                  [key]: taxonomy,
                };
              }
              return acc;
            }, settings?.taxMapping)
          : {},
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

    return {
      ...result,
      reducedVisibilityTermIds:
        result?.taxonomies?.["typeOfInstitution"]?.terms?.reduce(
          (acc: number[], term: any) => {
            if (!!term?.hasReducedVisibility) acc.push(term?.id);
            return acc;
          },
          []
        ) ?? [],
    }
  }

  return null;
};

export const useSettingsContext = () => useContext(SettingsContext);

// context provider
export const SettingsContextProvider = ({
  frontendSettings,
  children,
}: {
  frontendSettings: any;
  children: React.ReactNode;
}) => {
  const [settings] = useState(parseSettings(frontendSettings));

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
