import { getLocationColors } from "~/utils";
import { gql } from "@apollo/client";

export const tourQuery = gql`
  query ($slug: String!) {
    tour(slug: $slug) {
      id
      title
      slug
      distance
      duration
      teaser
      description
      orderNumber
      ownerId
      path
      heroImage {
        id
        meta
        status
        alt
        credits
        cropPosition
      }
      tourStopCount
      tourStops {
        id
        title
        number
        teaser
        description
        images {
          id
          status
          meta
          alt
          credits
        }
        heroImage {
          id
          status
          meta
          alt
          credits
          cropPosition
        }
        location {
          id
          title
          slug
          description
          lat
          lng
          primaryTerms {
            id
            name
          }
          terms {
            id
            name
          }
          heroImage {
            id
            status
            meta
            alt
            credits
            cropPosition
          }
        }
      }
    }
  }
`;

export const createTourStops = (
  stops: any,
  tourSlug: string,
  newIndex: number,
  settings: any
) => {
  return stops
    ?.map((ts: any, index: number) => ({
      number: ts?.number,
      id: ts?.location.id,
      lng: ts?.location?.lng,
      lat: ts?.location?.lat,
      title: ts?.title,
      slug: `/tour/${tourSlug}/${ts?.number}`,
      color: getLocationColors(ts?.location, settings).color,
      highlight: index === newIndex,
    }))
    .sort((a: any, b: any) => {
      if (a?.number < b?.number) return -1;
      if (a?.number > b?.number) return 1;
      return 0;
    });
};