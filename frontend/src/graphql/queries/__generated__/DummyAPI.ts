/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DummyAPI
// ====================================================

export interface DummyAPI_listTravellers {
  __typename: "Ticket";
  id: number;
  name: string;
  phone: number;
}

export interface DummyAPI {
  listTravellers: (DummyAPI_listTravellers | null)[];
}
