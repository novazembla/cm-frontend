import { from, ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import type { AppConfig } from "~/types";

import { appConfig } from "~/config/";

let client: ApolloClient<any> | null = null;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    // TODO: remove?
    graphQLErrors.forEach((err) =>
      console.log(
        err,
        `[GQLError error]: ${err.message} ${err?.extensions?.code ?? ""}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const createApolloClient = (config: AppConfig) => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([
      new RetryLink({
        delay: {
          initial: 500,
          max: 20000,
          jitter: true,
        },
        attempts: {
          max: 3,
          retryIf: (error /* , _operation */) => {
            return (
              !!error &&
              ![400, 403, 404].includes(parseInt(error.statusCode, 10))
            );
          },
        },
      }),
      errorLink,
      new HttpLink({
        uri: config.apiGraphQLUrl, // Server URL (must be absolute)
        // credentials: "include", // Additional fetch() options like `credentials` or `headers`
      }),
    ]),

    // TODO: find generic ways to manage the chache ...
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            events: {
              keyArgs: ["where", "orderBy"],
              merge(
                existing,
                incoming,
                { args: { pageIndex = 0, pageSize = 50 } }: { args: any }
              ) {
                const offset = pageIndex * pageSize;

                if (!incoming)
                  return {
                    totalCount: 0,
                    events: [],
                  };

                // Slicing is necessary because the existing data is
                // immutable, and frozen in development.
                const merged = existing?.events?.length
                  ? existing?.events.slice(0)
                  : [];
                for (let i = 0; i < incoming?.events?.length; i++) {
                  merged[offset + i] = incoming?.events[i];
                }
                return {
                  totalCount: incoming?.totalCount,
                  events: merged,
                };
              },
            },
            locations: {
              keyArgs: ["where", "orderBy"],
              merge(
                existing,
                incoming,
                { args: { pageIndex = 0, pageSize = 50 } }: { args: any }
              ) {
                const offset = pageIndex * pageSize;

                if (!incoming)
                  return {
                    totalCount: 0,
                    locations: [],
                  };

                // Slicing is necessary because the existing data is
                // immutable, and frozen in development.
                const merged = existing?.locations?.length
                  ? existing?.locations.slice(0)
                  : [];
                for (let i = 0; i < incoming?.locations?.length; i++) {
                  merged[offset + i] = incoming?.locations[i];
                }
                return {
                  totalCount: incoming?.totalCount,
                  locations: merged,
                };
              },
            },
            locationIds: {
              keyArgs: ["where"],
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "ignore"
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all"
      },
      mutate: {
        errorPolicy: "all"
      },
    },
  });
};

export const initializeClient = (settings: AppConfig) => {
  const aClient = client ?? createApolloClient(settings);

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return aClient;
  // Create the Apollo Client once in the client
  if (!client) client = aClient;

  return aClient;
};

export const getApolloClient = () => initializeClient(appConfig);
