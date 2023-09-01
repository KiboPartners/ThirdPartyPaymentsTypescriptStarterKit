import { ActionId } from "./arcTypes/index";

import { ExternalPaymentWorkflowDefinition } from '@kibocommerce/rest-sdk/clients/Settings/models/ExternalPaymentWorkflowDefinition'
import { credentials, WORKFLOW_NAME, WORKFLOW_DESCRIPTION } from "./credentialDefinition";

const Client = require('mozu-node-sdk/client')

export interface ArcJSConfig {
  actions?: (ActionsEntity)[] | null;
  configurations?: (null)[] | null;
  defaultLogLevel: string;
}
export interface ActionsEntity {
  actionId: string;
  contexts?: (ContextsEntity)[] | null;
}
export interface ContextsEntity {
  customFunctions?: (CustomFunctionsEntity)[] | null;
}
export interface CustomFunctionsEntity {
  applicationKey: string;
  functionId: string;
  enabled: boolean;
  configuration: any;
}

const constants = Client.constants;
const myClientFactory = Client.sub({
  getArcConfig: Client.method({
    method: constants.verbs.GET,
    url: '{+tenantPod}api/platform/extensions'
  }),
  setArcConfig: Client.method({
    method: constants.verbs.PUT,
    url: '{+tenantPod}api/platform/extensions'
  }),
  getThirdPartyWorkflow: Client.method({
    method: constants.verbs.GET,
    url: '{+tenantPod}api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows/{fullyQualifiedName}'
  }),
  getThirdPartyWorkflows: Client.method({
    method: constants.verbs.GET,
    url: '{+tenantPod}api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows'
  }),
  deleteThirdPartyWorkflow: Client.method({
    method: constants.verbs.DELETE,
    url: '{+tenantPod}api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows/{fullyQualifiedName}'
  }),
  addThirdPartyWorkflow: Client.method({
    method: constants.verbs.PUT,
    url: '{+tenantPod}api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows/'
  }),
}) as (context: any) => {
  getArcConfig: () => Promise<ArcJSConfig>,
  setArcConfig: (_: any, payload: { body: ArcJSConfig }) => any,
  getThirdPartyWorkflows: () => Promise<Array<ExternalPaymentWorkflowDefinition>>,
  getThirdPartyWorkflow: () => Promise<ExternalPaymentWorkflowDefinition>,
  deleteThirdPartyWorkflow: (params: { fullyQualifiedName: string }) => Promise<null>,
  addThirdPartyWorkflow: (_: any, payload: { body: ExternalPaymentWorkflowDefinition }) => any,
  context: any,
};

/**
 * The main implementation of the install function 
 * 
 * @param context context
 * @param callback callback
 */
export const platformApplicationsInstallImplementation = async (context: any, callback: (errorMessage?: string) => void) => {

  const myClient = myClientFactory(context)

  const arcConfig = await myClient.getArcConfig()

  try {

    for (const site of context.get.tenant().sites) {
      myClient.context[constants.headers.SITE] = site.id;
      const workflows = await myClient.getThirdPartyWorkflows()
      const fqn = "tenant~" + WORKFLOW_NAME
      const existingWorkflow = workflows.find(workflow => workflow.fullyQualifiedName == fqn)
      if (existingWorkflow) {
        // Replace the workflow if it has changed. These is no Update API
        await myClient.deleteThirdPartyWorkflow({ fullyQualifiedName: fqn })
      }

      await myClient.addThirdPartyWorkflow({}, {
        body: {
          name: WORKFLOW_NAME,
          namespace: "tenant",
          description: WORKFLOW_DESCRIPTION,
          fullyQualifiedName: fqn,
          isEnabled: false,
          isLegacy: true,
          credentials: credentials
        }
      })
      console.log("Workflow added")

    }


    // Payment after action
    const PAYMENT_AFTER_ACTION = ActionId[ActionId["embedded.commerce.payments.action.after"]]
    const paymentAfterActionContext: any = {
      "customFunctions": [
        {
          applicationKey: context.apiContext.appKey,
          functionId: PAYMENT_AFTER_ACTION,
          enabled: true
        }
      ]
    }
    const paymentAfterAction = arcConfig.actions?.find(a => a.actionId == PAYMENT_AFTER_ACTION)
    if (!paymentAfterAction) {
      arcConfig.actions?.push({
        actionId: PAYMENT_AFTER_ACTION,
        "contexts": [
          paymentAfterActionContext
        ]
      })
    } else if (paymentAfterAction.contexts?.some(c => c.customFunctions?.some(f => f.applicationKey == context.apiContext.appKey))) {
      paymentAfterAction.contexts?.push(paymentAfterActionContext)
    }

    // Payment before action
    const PAYMENT_BEFORE_ACTION = ActionId[ActionId["embedded.commerce.payments.action.before"]]
    const paymentBeforeContext: any = {
      "customFunctions": [
        {
          applicationKey: context.apiContext.appKey,
          functionId: PAYMENT_BEFORE_ACTION,
          enabled: true
        }
      ]
    }
    const paymentBeforeAction = arcConfig.actions?.find(a => a.actionId == PAYMENT_BEFORE_ACTION)
    if (!paymentBeforeAction) {
      arcConfig.actions?.push({
        actionId: PAYMENT_BEFORE_ACTION,
        "contexts": [
          paymentBeforeContext
        ]
      })
    } else if (paymentBeforeAction.contexts?.some(c => c.customFunctions?.some(f => f.applicationKey == context.apiContext.appKey))) {
      paymentBeforeAction.contexts?.push(paymentBeforeContext)
    }

    // Payment interaction action
    const PERFORM_PAYMENT_INTERACTION_ACTION = ActionId[ActionId["embedded.commerce.payments.action.performPaymentInteraction"]]
    const performPatyInteractionContext: any = {
      "customFunctions": [
        {
          applicationKey: context.apiContext.appKey,
          functionId: PERFORM_PAYMENT_INTERACTION_ACTION,
          enabled: true
        }
      ]
    }
    const paymentInteractionAction = arcConfig.actions?.find(a => a.actionId == PERFORM_PAYMENT_INTERACTION_ACTION)
    if (!paymentInteractionAction) {
      arcConfig.actions?.push({
        actionId: PERFORM_PAYMENT_INTERACTION_ACTION,
        "contexts": [
          performPatyInteractionContext
        ]
      })
    } else if (paymentInteractionAction.contexts?.some(c => c.customFunctions?.some(f => f.applicationKey == context.apiContext.appKey))) {
      paymentInteractionAction.contexts?.push(performPatyInteractionContext)
    }

    // Now we are all done, update the Arc config
    await myClient.setArcConfig({}, { body: arcConfig })
  } catch (err) {
    callback("There was an error installing.")
    //console.error(err)
  }
}
