
import { ExternalPaymentWorkflowDefinition } from '@kibocommerce/rest-sdk/clients/Settings/models/ExternalPaymentWorkflowDefinition'

// Modify this to your own Workflow name
// Note: WORKFLOW_NAME must not have any spaces
export const WORKFLOW_NAME = "NoOp3rdParty"
export const WORKFLOW_DESCRIPTION = "No Op 3rd Party Payments"

const externalPaymentWorkflow: ExternalPaymentWorkflowDefinition = {}

export type Credentials = {
  username: string
  password: string
  terminalID: string
}

export enum CredentialNames {
  username,
  password,
  terminalID,
}

export const credentials = [
  {
    displayName: "Username",
    apiName: CredentialNames[CredentialNames.username],
    vocabularyValues: [],
    inputType: "TextBox",
    isSensitive: false
  },
  {
    displayName: "Password",
    apiName: CredentialNames[CredentialNames.password],
    vocabularyValues: [],
    inputType: "TextBox",
    isSensitive: false
  },
  {
    displayName: "Terminal Id",
    apiName: CredentialNames[CredentialNames.terminalID],
    vocabularyValues: [],
    inputType: "TextBox",
    isSensitive: false
  },
] as typeof externalPaymentWorkflow.credentials
