import { gql } from 'apollo-boost';

export const dummyAPIQuery = gql`
  query DummyAPI {
    listTravellers {
      id
      name
      phone
    }
  }
`;
