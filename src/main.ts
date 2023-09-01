import { ActionId, createArcFunction } from "./arcTypes/index";
import { platformApplicationsInstallImplementation } from "./platformInstall";
import { PaymentGateway } from "./gateway";

import { PerformPaymentInteractionContext } from "./arcTypes/index"

// Not really that much use of before and after in 3rd party payments implementation, 
//  since you have complete control in the performPaymentInteraction. But it's
//  here in the starter kit if you need it.

const paymentAfterAction = createArcFunction(
  ActionId["embedded.commerce.payments.action.after"],
  function (context: any, callback: (errorMessage?: string) => void) {
    callback();
  }
);

const paymentBeforeAction = createArcFunction(
  ActionId["embedded.commerce.payments.action.before"],
  function (context: any, callback: (errorMessage?: string) => void) {
    callback();
  }
);

// The interesting part of the implementation is here. This processes
// the payment action and creates a payment interaction in response

const performPaymentInteraction = createArcFunction(
  ActionId["embedded.commerce.payments.action.performPaymentInteraction"],
  function (context: PerformPaymentInteractionContext, callback: (errorMessage?: string) => void) {

    const payment = context.get.payment()
    const paymentAction = context.get.paymentAction()
    const gateway = new PaymentGateway()

    const performAction = async () => {
      switch (paymentAction.actionName) {
        case "CreatePayment": {
          const createPaymentInteraction = await gateway.create(context, payment, paymentAction)
          context.exec.addPaymentInteraction(createPaymentInteraction)
        }
          break
        case "AuthorizePayment": {
          const authorizePaymentInteraction = await gateway.authorize(context, payment, paymentAction)
          context.exec.addPaymentInteraction(authorizePaymentInteraction)
        }
          break
        case "VoidPayment": {
          const voidPaymentInteraction = await gateway.void(context, payment, paymentAction)
          context.exec.addPaymentInteraction(voidPaymentInteraction)
        }
          break
        case "CapturePayment": {
          const capturePaymentInteraction = await gateway.capture(context, payment, paymentAction)
          context.exec.addPaymentInteraction(capturePaymentInteraction)
        }
          break
        case "CreditPayment": {
          const creditPaymentInteraction = await gateway.credit(context, payment, paymentAction)
          context.exec.addPaymentInteraction(creditPaymentInteraction)
        }
          break
        case "DeclinePayment": {
          const declinePaymentInteraction = await gateway.decline(context, payment, paymentAction)
          context.exec.addPaymentInteraction(declinePaymentInteraction)
        }
          break
      }
    }

    performAction().then(() => {
      callback()
    }).catch((err) => {
      console.error(err)
      callback('error');
    })
  }
);

const platformApplicationsInstall = createArcFunction(
  ActionId["embedded.platform.applications.install"],
  function (context: any, callback: (errorMessage?: string) => void) {
    console.log("ts installing");
    platformApplicationsInstallImplementation(context, callback).then(() => {
      callback()
    })
  }
);

export default {
  "embedded.commerce.payments.action.after": paymentAfterAction,
  "embedded.commerce.payments.action.before": paymentBeforeAction,
  "embedded.commerce.payments.action.performPaymentInteraction": performPaymentInteraction,
  "embedded.platform.applications.install": platformApplicationsInstall,
}