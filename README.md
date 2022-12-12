# Approov Quickstart: Web - Javascript - hCaptcha

This quickstart is for Javascript web apps that are using the hCaptcha service and that you wish to protect with Approov. If this is not your situation then please check if there is a more relevant quickstart guide available.

This quickstart provides the basic steps for integrating Approov into your web app. A more detailed step-by-step guide using a [Shapes App Example](./SHAPES-EXAMPLE.md) is also available.

To follow this guide you should have received an onboarding email for a trial or paid Approov account.

## ADDING THE APPROOV WEB SDK

The Approov integration is available on request by email to support@approov.io. Once you receive the Approov web SDK Javascript file `approov.js` copy it into your project and load it as part of your web app:

```html
  <script type="module" src="./approov.js"></script>
```

## USING THE APPROOV WEB SDK

Add the following code to your app implementation to import the Approov web SDK:

```js
import { Approov, ApproovError, ApproovFetchError, ApproovServiceError, ApproovSessionError } from "./approov.js"
```

Add this function which initializes the Approov SDK, gets an hCaptcha token and requests an Approov token as required:

```js
async function fetchApproovToken(api) {
  try {
    // Try to fetch an Approov token
    let approovToken = await Approov.fetchToken(api, {})
    return approovToken
  } catch (error) {
    if (error instanceof ApproovSessionError) {
      // If Approov has not been initialized or the Approov session has expired, initialize and start a new one
      await Approov.initializeSession({
        approovHost: 'web-1.approovr.io',
        approovSiteKey: 'your-Approov-site-key',
        hcaptchaSiteKey: 'your-hCaptcha-site-key',
      })
      // Get a fresh hCaptcha token
      const hcaptchaToken = await hcaptcha.execute({async: true})
      // Fetch the Approov token
      let approovToken = await Approov.fetchToken(api, {hcaptchaToken: hcaptchaToken})
      return approovToken
    } else {
      throw error
    }
  }
}
```

Customize the function using your Approov site key and hCaptcha site key to replace `your-Approov-site-key` and `your-hCaptcha-site-key`, respectively.

Finally, modify the location in your code that generates the request headers to include an Approov token, for example change your function that includes an hCaptcha token in the headers, to fetch and include an Approov token instead:

```js
async function addRequestHeaders() {
  let headers = new Headers()
  // Add some headers here
  // ...
  // Then fetch and add the Approov token
  try {
    let approovToken = await fetchApproovToken('your-API-domain')
    headers.append('Approov-Token', approovToken)
  } catch (error) {
    console.log(JSON.stringify(error))
  }
  return headers
}
```

Customize the function above by using the domain you would like to protect with Approov in place of `your-API-domain`.

## ERROR TYPES

The `Approov.fetchToken` function may throw specific errors to provide additional information:

* `ApproovFetchError` Any error thrown by the `fetch` call made to perform a request to the Approov service. This
    indicates that there was a communication or network issue.
* `ApproovServiceError` An error reported by the Approov service, such as missing or malformed elements in the underlying
    request. The `errors` property contains additional information.
* `ApproovSessionError` The Approov session has not been initialized or has expired. A call to `Approov.initializeSession`
    should be made.
* `ApproovError` Any other error thrown during an Approov web SDK call.

## SETTING UP API PROTECTION

To actually protect your APIs there are some further steps:

* The Approov service needs to be set up to provide tokens for your API.
* Your API server needs to perform an Approov token check in addition to the steps in this frontend guide. Various [Backend API Quickstarts](https://approov.io/resource/quickstarts/#backend-api-quickstarts) are available to suit your particular situation depending on the backend technology used.

## APPROOV SERVICE SETUP

The Approov service setup steps require access to the [Approov CLI](https://approov.io/docs/latest/approov-cli-tool-reference/), please follow the [Installation](https://approov.io/docs/latest/approov-installation/) instructions.

### ADDING API DOMAINS

In order for the Approov service to provide Approov tokens for particular API domains it is necessary to inform Approov about these. Execute the following command:

```
approov api -add your.domain -allowWeb
```

### ADDING A HCAPTCHA SITE

A hCaptcha site can be added by by providing a valid site key and secret. The following command adds a site leaving all other settings at their default values:

```
approov web -hcaptcha -add your-hCaptcha-site-key -secret your-hCaptcha-secret
```

To change a subscription you simply add it again with all the properties required for the changed subscription. Each addition of the same browser token completely overwrites the previously stored entry.

You are now set up to request and receive Approov tokens.

## CHECKING IT WORKS

Your Approov onboarding email should contain a link allowing you to access [Live Metrics Graphs](https://approov.io/docs/latest/approov-usage-documentation/#metrics-graphs). After you've run your web app with Approov integration you should be able to see the results in the live metrics within a minute or so.

The Approov CLI can check Approov token validity and display the claims. Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```text
approov token -check your-Approov-token
```

## FURTHER OPTIONS

Please also see the full documentation of the [Approov Web Protection Integration](https://approov.io/docs/latest/approov-web-protection-integration/).

### Token Binding

If want to use [Token Binding](https://approov.io/docs/latest/approov-web-protection-integration/#web-protection-token-binding) then pass the data to be used for binding as follows:

```js
const payload = new TextEncoder().encode(data)
Approov.fetchToken(api, {hcaptchaToken: result, payload: payload}))
```

This results in the SHA-256 hash of the passed data to be included as the `pay` claim in any Approov tokens issued until a new value for the payload is passed to a call to `Approov.fetchToken`. Note that you should select a value that does not typically change from request to request, as each change requires a new Approov token to be fetched.
