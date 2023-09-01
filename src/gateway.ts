
const Client = require('mozu-node-sdk/client')
import { Payment } from '@kibocommerce/rest-sdk/clients/commerce/models/Payment'
import { PaymentAction } from '@kibocommerce/rest-sdk/clients/commerce/models/PaymentAction'
import { PaymentInteraction } from '@kibocommerce/rest-sdk/clients/commerce/models/PaymentInteraction'
import { CheckoutSettings } from '@kibocommerce/rest-sdk/clients/Settings/models/CheckoutSettings'

import { PerformPaymentInteractionContext } from "./arcTypes/index"
import { CredentialNames, Credentials, WORKFLOW_NAME } from "./credentialDefinition";

const constants = Client.constants;
const myClientFactory = Client.sub({
  getCheckoutSettings: Client.method({
    method: constants.verbs.GET,
    url: '{+tenantPod}api/commerce/settings/checkout'
  }),
}) as (context: any) => {
  getCheckoutSettings: () => Promise<CheckoutSettings>,
}

export class PaymentGateway {

  /** Get credentials from the payment settings, you can use these to configure or authenticate with your service */
  async getCredentials(context: PerformPaymentInteractionContext): Promise<Credentials> {
    const checkoutSettings = await myClientFactory(context).getCheckoutSettings()

    const fqn = "tenant~" + WORKFLOW_NAME
    const theseSettings = checkoutSettings.paymentSettings?.externalPaymentWorkflowDefinitions?.find(definition => definition.fullyQualifiedName == fqn)

    return {
      username: theseSettings?.credentials?.find(c => c.apiName == CredentialNames[CredentialNames.username])?.value || '',
      password: theseSettings?.credentials?.find(c => c.apiName == CredentialNames[CredentialNames.password])?.value || '',
      terminalID: theseSettings?.credentials?.find(c => c.apiName == CredentialNames[CredentialNames.terminalID])?.value || '',
    }
  }

  /** Create a new Payment */
  async create(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "New",
      interactionType: "Authorization",
      gatewayResponseCode: "201",
      gatewayResponseText: "Created Via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

  /** Authorize payment */
  async authorize(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "Authorized",
      interactionType: "Authorization",
      gatewayResponseCode: "201",
      gatewayResponseText: "Authorized via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

  /** Void payment */
  async void(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "Voided",
      interactionType: "Void",
      gatewayResponseCode: "201",
      gatewayResponseText: "Voided via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

  /** Capture payment */
  async capture(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "Captured",
      interactionType: "Capture",
      gatewayResponseCode: "201",
      gatewayResponseText: "Captured via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

  /** Credit Payment */
  async credit(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "Credited",
      interactionType: "Credit",
      gatewayResponseCode: "201",
      gatewayResponseText: "Credited via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

  /** Decline payment */
  async decline(context: PerformPaymentInteractionContext, payment: Payment, paymentAction: PaymentAction): Promise<PaymentInteraction> {
    const credentials = await this.getCredentials(context)
    return {
      status: "Declined",
      interactionType: "Decline",
      gatewayResponseCode: "201",
      gatewayResponseText: "Declined via NoOp",
      amount: paymentAction.amount,
      isManual: false
    }
  }

}