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
