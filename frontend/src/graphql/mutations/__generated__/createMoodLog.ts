/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { InputMoodLog, ImpactEnum } from "./../../../../__generated__/clientGlobalTypesFile";

// ====================================================
// GraphQL mutation operation: createMoodLog
// ====================================================

export interface createMoodLog_createMoodLog {
  __typename: "MoodLog";
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: ImpactEnum;
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
