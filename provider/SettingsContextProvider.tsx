import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { isObject } from "~/utils";

let currentSettingsInMemory = {};

// create context
const SettingsContext = createContext<any>(currentSettingsInMemory);


const parseSettings = (settings: any) => {
  if (settings && isObject(settings)) {
    return {
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
  const [settings, setSettings] = useState(parseSettings(frontendSettings));

  // useEffect(() => {    
  //   let mounted = true;
  //   if (frontendSettings) {
  //     console.log("props settings");
  //     setSettings(parseSettings(frontendSettings));
  //   } else {
  //     const getSettings = async () => {
  //       const client = getApolloClient();

  //       const { data } = await client.query({
  //         query: settingsQuery,
  //       });

  //       if (data?.frontendSettings) {
  //         if (mounted) setSettings(parseSettings(data?.frontendSettings));
  //       }
  //     };

  //     if (!settings) {
  //       getSettings();
  //     }
  //   }
  //   return () => {
  //     mounted = false;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
