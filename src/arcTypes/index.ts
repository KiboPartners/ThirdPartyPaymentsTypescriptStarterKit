/**
 * Modify this list if you need more actions
 */
export enum ActionId {
  "embedded.commerce.payments.action.after",
  "embedded.commerce.payments.action.before",
  "embedded.commerce.payments.action.performPaymentInteraction",
  "embedded.platform.applications.install",
}

import { Payment } from '@kibocommerce/rest-sdk/clients/commerce/models/Payment'
import { PaymentAction } from '@kibocommerce/rest-sdk/clients/commerce/models/PaymentAction'
import { PaymentInteraction } from '@kibocommerce/rest-sdk/clients/commerce/models/PaymentInteraction'

export type PerformPaymentInteractionContext = {
  get: {
    payment: () => Payment,
    paymentAction: () => PaymentAction,
  },
  exec: {
    addPaymentInteraction: (interaction: PaymentInteraction) => null,
    setPaymentAmountRequested: (amountRequested: number) => any,
    setPaymentAmountCollected: (amountCollected: number) => any,
    setPaymentAmountCredited: (amountCredited: number) => any,
    isForOrder: () => boolean,
    isForReturn: () => boolean,
    isForCheckout: () => boolean,
    setAuthorized: (isAuthorized: boolean) => any,
  }
}

export interface ArcFunction {
  actionName: string;
  customFunction: (
    context: any,
    callback: (errorMessage?: string) => void
  ) => void;
}

export function createArcFunction(
  actionName: ActionId,
  customFunction: (
    context: any,
    callback: (errorMessage?: string) => void
  ) => void
): ArcFunction {
  return { actionName: ActionId[actionName], customFunction: customFunction };
}
