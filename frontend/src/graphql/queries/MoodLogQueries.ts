import { gql } from 'apollo-boost';

export const getAllMoodLogsQuery = gql`
query getAllMoodLogs($email: String!) {
  getAllMoodLogs(email: $email) {
    _id
    email
    logdatetime
    overallfeeling
    happinesslevel
    mostimpact
  }
}
`;

export const getExistingMoodLogQuery = gql`
query getExistingMoodLog($email: String!, $date: GraphQLDate!) {
  getExistingMoodLog(email: $email, date: $date) {
    _id
    email
    logdatetime
    overallfeeling
    happinesslevel
    mostimpact
  }
}
`