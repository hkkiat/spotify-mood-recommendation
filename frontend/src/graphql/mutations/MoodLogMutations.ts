import { gql } from 'apollo-boost';

export const createMoodLog = gql`
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