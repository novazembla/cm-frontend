import { gql } from "@apollo/client";

export const locationsIdsQuery = gql`
  query locationsIds($where: JSON) {
    locationIds(where: $where) {
      ids
    }
  }
`;

export const locationsInitialQueryState = {
  where: {},
  orderBy: [
    {
      id: "asc",
    },
  ],
  pageSize: 20,
  pageIndex: 0,
};


export const locationsQuery = gql`
  query locations(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    locations(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalCount
      locations {
        id
        title
        slug
        description
        primaryTerms {
          id
          taxonomyId
          name
        }
        terms {
          id
          taxonomyId
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
`;