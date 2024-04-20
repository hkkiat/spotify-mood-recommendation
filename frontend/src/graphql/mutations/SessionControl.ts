import { gql } from 'apollo-boost';

 export const login = gql`
   mutation login($email: String!, $password: String!) {
     login(email: $email, password: $password) {
       message
       extra
     }
   }
 `;

 export const register = gql`
    mutation register($email: String!, $password: String!) {
      register(email: $email, password: $password) {
        message
        extra
      }
    }
  `;
