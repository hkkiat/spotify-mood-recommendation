/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { InputMoodLog } from "./../../../../__generated__/clientGlobalTypesFile";

// ====================================================
// GraphQL mutation operation: createMoodLog
// ====================================================

export interface createMoodLog_createMoodLog {
  __typename: "MoodLog";
  _id: string;
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: string;
}

export interface createMoodLog {
  /**
   * Mutation to create a day's moodlog for person
   */
  createMoodLog: createMoodLog_createMoodLog | null;
}

export interface createMoodLogVariables {
  moodlog: InputMoodLog;
}
