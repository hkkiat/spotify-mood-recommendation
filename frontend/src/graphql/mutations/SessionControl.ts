import { gql } from 'apollo-boost';

 export const login = gql`
   mutation Login($email: String!, $password: String!) {
     login(email: $email, password: $password) {
       message
       extra
     }
   }
 `;

 export const register = gql`
    mutation Register($email: String!, $password: String!) {
      register(email: $email, password: $password) {
        message
        extra
      }
    }
  `;

  export const logout = gql`
    mutation Logout {
      logout {
        message
        extra
      }
    }
  `;

  export const dummyLoginCheck = gql`
    query DummyLoginCheck {
      dummyLoginCheck {
        message
        extra
      }
    }
  `;
