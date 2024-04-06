/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ImpactEnum {
  FAMILY = "FAMILY",
  FRIENDS = "FRIENDS",
  LIFE = "LIFE",
  STUDY = "STUDY",
  WORK = "WORK",
}

export interface InputMoodLog {
  email: string;
  logdatetime: any;
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: ImpactEnum;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
