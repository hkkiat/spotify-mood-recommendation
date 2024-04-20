/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getExistingMoodLog
// ====================================================

export interface getExistingMoodLog_getExistingMoodLog {
  __typename: "MoodLog";
  _id: string;
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: string;
}

export interface getExistingMoodLog {
  getExistingMoodLog: getExistingMoodLog_getExistingMoodLog | null;
}

export interface getExistingMoodLogVariables {
  email: string;
  date: any;
}
