# Third Party Payments TypeScript API Extensions Starter Kit

This is a starter kit for using Third Party Payment extensibility.

Third Party Payments are for payments which are outside of PCI scope, so implementations that rely solely on tokens, and not PCI data like credit card numbers. If you can implement your payment connector only using tokens, this is the best way to implement your payments. You can implement in API extensions and upload changes at any time without having to wait for Kibo certification.

Note that there is no admin support for adding 3rd party payments. They must be submitted from the storefront (in an Ecommerce implementation), or in the Create Order call (Order Management solutions). Also note that Third Party Payments expect a single capture, so it will not split the payment.

## Getting Started

The starter kit contains a NoOp payment gateway, that will always accept the payments. You will need to modify it to call gateway service. 

You will need to first upload the code to a new application, modify the code to your needs, install, and then test.

## Install

First install the dependencies with: `npm install`

Then build with `grunt`. It will run through eslint and Typescript checks, compile the code into the assets folder, and then upload to your application using mozusync as usual.

Then go to your application in Dev Center, and click Install on your tenant. This will automaticaly add the API Extensions in the Action Management JSON Editor, and add the 3rd Party Workflow in the Payment Types. You can then go to the Payment Types screen, add your credentials, enable, and then Save.

## Platform Install Script

The `src/platformInstall.ts` script handles two things when your application is installed on a tenant:

1. **Gateway configuration** — Creates (or replaces) the third-party payment workflow under `System > Settings > Payment Types`, including all credential fields defined in `src/credentialDefinition.ts`.
2. **API Extension actions** — Adds entries for `embedded.commerce.payments.action.before`, `embedded.commerce.payments.action.after`, and `embedded.commerce.payments.action.performPaymentInteraction` to the API Extensions configuration.

The script uses these APIs internally; you can also call them manually if needed:

| Purpose | Method | Endpoint |
|---|---|---|
| Get/update API Extensions config | `GET` / `PUT` | `api/platform/extensions` |
| List third-party workflows | `GET` | `api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows` |
| Add/replace a workflow | `PUT` | `api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows/` |
| Delete a workflow | `DELETE` | `api/commerce/settings/checkout/paymentsettings/thirdpartyworkflows/{fullyQualifiedName}` |

### Before Installing — Required Changes

Make the following changes in [`src/credentialDefinition.ts`](src/credentialDefinition.ts) before installing:

1. **Update the workflow name and description** ([line 6](src/credentialDefinition.ts#L6)) — `WORKFLOW_NAME` must be unique across your tenant and must not contain spaces. Update `WORKFLOW_DESCRIPTION` to describe your gateway.

   ```ts
   export const WORKFLOW_NAME = "MyGateway3rdParty"
   export const WORKFLOW_DESCRIPTION = "My Gateway 3rd Party Payments"
   ```

2. **Update the credential fields** ([line 23](src/credentialDefinition.ts#L23)) — Define the fields that will appear in the Payment Types configuration screen. Add or remove entries to match what your gateway requires (e.g. API key, merchant ID, endpoint URL).

### After Installing — Verification Steps

After clicking Install in Dev Center, verify the following before configuring credentials:

1. **Payment Types** — Go to `System > Settings > Payment Types`. You should see a new tab for your gateway with the credential fields you defined. It will be disabled by default.

2. **API Extension action contexts** — If your tenant already has other third-party payment integrations installed, check the API Extensions configuration (Action Management JSON Editor). This is the most important verification step.

   **All integrations must share a single context array** (i.e. no `siteId` scoping) unless you explicitly want an action to fire only for a specific site. For example, `embedded.commerce.payments.action.before` should have all `customFunctions` from every integration grouped under one `contexts` entry:

   ```json
   {
     "actionId": "embedded.commerce.payments.action.before",
     "contexts": [
       {
         "customFunctions": [
           { "applicationKey": "KUPT.demo_api_ext.1.0.1.Release",          "functionId": "embedded.commerce.payments.action.before", "enabled": true },
           { "applicationKey": "mzint.mppe.2.0.8.Release",                   "functionId": "embedded.commerce.payments.action.before", "enabled": true },
           { "applicationKey": "KUPT.demo_no_op_3rdparty.1.0.0.Release",   "functionId": "embedded.commerce.payments.action.before", "enabled": true }
         ]
       }
     ]
   }
   ```

   If the install script added a separate `contexts` entry for your integration instead of appending to the existing one, **correct this manually** in the JSON editor before testing.

3. **Configure and test** — Once the configuration looks correct, enter your gateway credentials in Payment Types, enable the workflow, save, and run a test transaction.

## Development

First, go to `src/credentialDefinition.ts` and give your payment workflow a unique name.

Then you can begin the implementation. You should be able to just modify `src/gateway.ts`. This class contains the methods which Kibo defines payment actions on. 

If you want another reference, you can use the [PayPal Express 2](https://github.com/Mozu/PayPal-Express) code. The TypeScript types here should make the development much easier than using the PayPal as a base though.

## Create Payment Action Payloads

Example Create Payment Action payload:

```
{
  "status": "New",
  "externalTransactionId": "123412341234",
  "amount": 23,
  "newBillingInfo": {
    "paymentType": "NoOp3rdParty",
    "paymentWorkflow": "NoOp3rdParty",
    "billingContact": {
      "email": "andy@example.com",
      "firstName": "Andy",
      "lastNameOrSurname": "Kales",
      "companyOrOrganization": "",
      "phoneNumbers": {
        "home": "1231231234",
        "mobile": "1231231234"
      },
      "address": {
        "address1": "1234 Fake St",
        "address2": "54321",
        "cityOrTown": "Los Angeles",
        "stateOrProvince": "CA",
        "postalOrZipCode": "90034",
        "countryCode": "US",
        "isValidated": false
      }
    },
    "isSameBillingShippingAddress": true,
    "isRecurring": false
  },
  "data": {
    "my_custom_field": "12345",
    "my_custom_field2": "54321"
  }
}
```
