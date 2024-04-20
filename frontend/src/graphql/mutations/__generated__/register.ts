/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: register
// ====================================================

export interface register_register {
  __typename: "CommonResponse";
  message: string;
  extra: string | null;
}

export interface register {
  register: register_register;
}

export interface registerVariables {
  email: string;
  password: string;
}
