/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImpactEnum } from "./../../../../__generated__/clientGlobalTypesFile";

// ====================================================
// GraphQL query operation: getAllMoodLogs
// ====================================================

export interface getAllMoodLogs_getAllMoodLogs {
  __typename: "MoodLog";
  _id: string;
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: ImpactEnum;
}

export interface getAllMoodLogs {
  /**
   * Query to retrieve all moodlogs for person
   */
  getAllMoodLogs: (getAllMoodLogs_getAllMoodLogs | null)[] | null;
}

export interface getAllMoodLogsVariables {
  email: string;
}
