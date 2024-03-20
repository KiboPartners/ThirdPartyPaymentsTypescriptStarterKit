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
