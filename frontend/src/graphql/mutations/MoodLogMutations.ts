import { gql } from 'apollo-boost';

export const createMoodLogMutation = gql`
mutation createMoodLog($moodlog: InputMoodLog!) {
    createMoodLog(moodlog: $moodlog) {
      email
      logdatetime
      overallfeeling
      happinesslevel
      mostimpact
    }
  }
`;

export const updateMoodLogMutation = gql`
mutation updateMoodLog($moodlog: InputMoodLog!) {
  updateMoodLog(moodlog: $moodlog) {
    _id
    email
    logdatetime
    overallfeeling
    happinesslevel
    mostimpact
  }
}
`