import { gql } from 'apollo-boost';

export const userQuery = gql`
  query userQuery($id: ID!) {
    user(id: $id) {
      id
      username
      email
    }
  }
`;
