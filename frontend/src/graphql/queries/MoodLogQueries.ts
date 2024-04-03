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