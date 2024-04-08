/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { InputMoodLog } from "./../../../../__generated__/clientGlobalTypesFile";

// ====================================================
// GraphQL mutation operation: updateMoodLog
// ====================================================

export interface updateMoodLog_updateMoodLog {
  __typename: "MoodLog";
  _id: string;
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: string;
}

export interface updateMoodLog {
  updateMoodLog: updateMoodLog_updateMoodLog | null;
}

export interface updateMoodLogVariables {
  moodlog: InputMoodLog;
}
