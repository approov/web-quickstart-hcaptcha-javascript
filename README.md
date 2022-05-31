# Approov Web QuickStart: hCaptcha - Javascript

[Approov](https://approov.io) is an API security solution used to verify that requests received by your API services originate from trusted versions of your apps. The core Approov product is targeted at mobile apps, however, we provide several integrations with 3rd party web protection solutions so that a single back-end Approov check can be used to authorize API access. This quickstart shows how to use the integration with hCaptcha to add Approov tokens to your API calls.

[hCaptcha](https://www.hcaptcha.com/) is a popular service for determining if a browser is being operated by a human. A browser first retrieves a token from the hCaptcha API which is then passed to the protected API as part of a request. A query, from the protected API, obtains the full set of results associated with the token and uses this to determine whether to accept or reject its request. hCaptcha also provides further configuration options which extend the capabilities and/or customize behavior. For an overview of all enterprise level features, you should check out [botstop.com](https://botstop.com).

Note that, hCaptcha web protection does not solve the same issue as [Approov mobile app attestation](https://approov.io/product) which provides a very strong indication that a request can be trusted. However, for APIs that are used by both the mobile and web channels, a single check to grant access, simplifies the overall access control implementation. Approov's integration with hCaptcha requires that the backend first check that an Approov token is present and that it is correctly signed. Subsequently, the token claims can be read to differentiate between requests coming from the mobile or web channels and to apply any associated restrictions. If required, the full response from the hCaptcha check can be embedded in the Approov token to be used by that logic. We still recommend that you restrict critical API endpoints to only work from the Mobile App.

This quickstart provides a step-by-step guide to integrating hCaptcha with Approov in a web app using a simple demo API backend for obtaining a random shape. The integration uses plain Javascript without using any libraries or SDKs except those providing the hCaptcha integration. As such, you should be able to use it directly or easily port it to your preferred web framework or library.

If you are looking for another Approov integration you can check our list of [quickstarts](https://approov.io/docs/latest/approov-integration-examples/backend-api/), and if you don't find what you are looking for, then please let us know [here](https://approov.io/contact).


## TOC - Table of Contents

* [What you will need?](#what-you-will-need)
* [What you will learn?](#what-you-will-learn)
* [How it Works?](#how-it-works)
* [Starting the Web Server](#starting-the-web-server)
* [Running the Shapes Web App without Approov](#running-the-shapes-web-app-without-approov)
* [Modify the Web App to use Approov with hCaptcha](#modify-the-web-app-to-use-approov-with-hcaptcha)
* [Running the Shapes Web App with Approov and hCaptcha](#running-the-shapes-web-app-with-approov-and-hcaptcha)
* [What if I don't get Shapes](#what-if-i-dont-get-shapes)
* [Changing your own Web App to use Approov](#changing-your-own-web-app-to-use-approov)
* [Content Security Policy](#content-security-policy)
* [Next Steps](#next-steps)


## WHAT YOU WILL NEED

* Access to a trial or paid Approov account
* Be [registered](https://www.hcaptcha.com/signup-interstitial) with hCaptcha
* The `approov` command line tool [installed](https://approov.io/docs/latest/approov-installation/) with access to your account
* A web server or Docker installed
* The contents of the folder containing this README

[TOC](#toc-table-of-contents)


## WHAT YOU WILL LEARN

* How to integrate hCaptcha with Approov on a real web app in a step by step fashion
* How to setup your web app to get valid Approov hCaptcha tokens
* A solid understanding of how to integrate hCaptcha with Approov into your own web app
* Some pointers to other Approov features

[TOC](#toc-table-of-contents)


## HOW IT WORKS?

This is a brief overview of how the Approov cloud service and hCaptcha fit together. For a complete overview of how the frontend and backend work with the Approov cloud service, we recommend the [Approov overview](https://approov.io/product) page on our website.

### hCaptcha

hCaptcha uses sophisticated machine learning models to tell humans and bots apart. This approach enables them to reduce the CAPTCHA friction for users and therefore improve the web experience.

In the combined Approov/hCaptcha flow, each API request made by the web app is handled such that:

* An hCaptcha token is fetched using the hCaptcha JS SDK
* A web protection request is made to the Approov cloud service passing the hCaptcha token for verification
* The Approov token returned from the Approov web protection request is added to the API request
* The API request is made as usual by the web app

The API backend, is always responsible for making the decision to accept or deny requests. This decision is never made by the client. In all flows using Approov, access is only granted if a valid Approov token is included with the request; the client (web app or mobile app) is unable to determine the validity of the token. Subsequent checks may further interrogate the contents of the Approov token and also check other credentials, such as user authorization, to refine how a request should be handled.

### Approov Cloud Service

The Approov cloud service checks with the hCaptcha service that the received hCaptcha token is valid, and then the web protection request is handled such that:

* If the hCaptcha token check passes then a valid Approov token is returned to the web app
* If the hCaptcha token check fails then a legitimate looking Approov token will be returned

In either case, the web app, unaware of the token's validity, adds it to every request it makes to the Approov protected API(s).

[TOC](#toc-table-of-contents)


## STARTING THE WEB SERVER

This quickstart uses a static web app and so you can use any web server to run it. The web app root is: `./shapes-app/index.html`.

If you have no other preference then please choose from one of the following options.

### Docker

From the root of the quickstart run:

```txt
sudo docker-compose up local
```

This will first build the docker image and then start a container with it.

### Python

If your system has Python 3 installed then the simplest way to run the web server is to:

```
cd shapes-app
python3 -m http.server
```

### NodeJS

If you have NodeJS installed you can do:

```
cd shapes-appnpm install http-server -g
http-server --port 8000
```

### Running the Web App

Now visit http://localhost:8000 and you should be able to see:

<p>
  <img src="/readme-images/homepage.png" width="480" title="Shapes web app home page">
</p>

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITHOUT APPROOV

Now that you have completed the deployment of your web app with one of your preferred web servers it is time to see how it works.

In the home page you can see three buttons, and you should now click in the `UNPROTECTED` button to see the unprotected Shapes web app":

<p>
  <img src="/readme-images/unprotected-homepage.png" width="480" title="Shapes unprotected web app home page">
</p>

Click on the `HELLO` button and you should see this:

<p>
  <img src="/readme-images/unprotected-hello-page.png" width="480" title="Shapes unprotected web app hello page">
</p>

This checks the connectivity by connecting to the endpoint `https://shapes.approov.io/v1/hello`.

Now press the `SHAPE` button and you will see this:

<p>
  <img src="/readme-images/unprotected-shape-page.png" width="480" title="Shapes unprotected web app shape page">
</p>

This contacts `https://shapes.approov.io/v1/shapes` to get a random shape.

Although the Shapes API is very simple, 2 end-points, with some code in a web app to control presentation, it is sufficient to demonstrate the required changes. The starting point in a real world scenario is the same. An API, probably using Approov to protect the mobile channel, and either a new requirement to enable access from the web or a desire to simplify the existing access that uses hCaptcha to protect against scripts and bots. The code changes below assume the former and take you through the steps to add both hCaptcha and Approov to the Shapes web app.

First, to simulate the web app working with an API endpoint protected with Approov tokens edit `shapes-app/unprotected/assets/js/app.js` and change the `API_VERSION` to `v2`, like this:

```js
const API_VERSION = "v2"
```

Now save the file and do a hard refresh in your browser with `ctrl + F5`, then hit the `SHAPE` button again and you should see this:

<p>
  <img src="/readme-images/unprotected-v2-shape-page.png" width="480" title="Shapes unprotected web app V2 shape page">
</p>

It gets the status code 400 (Bad Request) because this endpoint is protected by Approov.

The changes below will add the required Approov token to the API request by first issuing a hCaptcha check and then exchanging the returned hCaptcha token for an Approov token using the Approov hCaptcha integration.

[TOC](#toc-table-of-contents)


## MODIFY THE WEB APP TO USE APPROOV WITH hCaptcha

We will need to modify two files, `index.html` and `app.js`.

If you suspect something has gone wrong while performing the changes you can always compare what you have with the files in the `shapes-app/approov-hcaptcha-protected/` directory.

For example, the following commands will show the set of differences required for the two files that will change:

```text
git diff --no-index shapes-app/unprotected/index.html shapes-app/approov-hcaptcha-protected/index.html

git diff --no-index shapes-app/unprotected/assets/js/app.js shapes-app/approov-hcaptcha-protected/assets/js/app.js
```

Overall, the changes required to add both these services are small.

#### Load and Setup for the hCaptcha Script in the HTML markup

Modify `shapes-app/unprotected/index.html` to load the hCaptcha JS SDK by adding the following markup after the `</title>` tag:

```text
<script src="https://hcaptcha.com/1/api.js" async defer></script>
```

Now we also need to bind the click events in the `HELLO` and `SHAPE` buttons to the hCaptcha script and have the `fetchHello` and `fecthShape` functions as the callbacks to receive the hCaptcha token.

Modify the file `shapes-app/unprotected/index.html` to add the necessary HTML changes for the `HELLO` and `SHAPE` buttons:

```xml
<div class="mt-2 py-2 border-t border-gray-300">
  <div class="flex flex-wrap justify-center">
    <div class="py-4 px-8 mt-0">
      <button
        id="hello-button"
        class="h-captcha button-transition bg-blue-500 active:bg-blue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1"
        type="button"
        data-sitekey="___HCAPTCHA_SITE_KEY___"
        data-callback='fetchHello'
      >
        Hello
      </button>
    </div>

    <div class="py-4 px-8 mt-0">
      <button
        id="shape-button"
        class="h-captcha button-transition bg-blue-500 active:bg-blue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1"
        type="button"
        data-sitekey="___HCAPTCHA_SITE_KEY___"
        data-callback='fetchShape'
      >
        Shape
      </button>
    </div>
  </div>
</div>
```

The additions can be summarised as follows:

* The `hCaptcha` css class is required so that the hCaptcha SDK can identify the target element
* The `data-sitekey` attribute is used to identify the site subscription to the hCaptcha servers
* The `data-callback` attribute registers the callback function to receive the hCaptcha token

Now that we have made the hCaptcha script trigger off the click events in the `HELLO` and `SHAPE` buttons we need to remove the listeners for the `click` event in `app.js`. We also used `fetchHello` and `fetchShape` as the callbacks to receive the hCaptcha token, so we will also need to change them to handle the new parameter. The next section will show how to do it.

#### Javascript changes to implement Approov with hCaptcha

Modify the file `shapes-app/unprotected/assets/js/app.js` to remove the click handler registrations for the `HELLO` and `SHAPE` buttons from the `load` event handler which just leaves the navbar click handler in that function:

```js
window.addEventListener('load', (event) => {
  const navbar = document.getElementById('toggle-navbar')
  navbar.addEventListener('click', (event) => toggleNavbar('example-collapse-navbar'))
})

const API_VERSION = "v2"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN
```

Follow this by adding required constants and the `fetchApproovToken` function, directly after the `API_BASE_URL` constant definition:

```js
const APPROOV_WEB_PROTECT_URL = 'https://web-1.approovr.io/attest'
const APPROOV_SITE_KEY = '___APPROOV_SITE_KEY___'
const HCAPTCHA_SITE_KEY = '___HCAPTCHA_SITE_KEY___'

// The hcaptcha token needs to be retrieved each time we want to make an
// API request with an Approov Token.
function fetchApproovToken(hCaptchaToken) {
  const params = new URLSearchParams()

  // Add it like `api.example.com` not as `https://api.example.com`.
  params.append('api', API_DOMAIN)
  params.append('approov-site-key', APPROOV_SITE_KEY)
  params.append('hcaptcha-site-key', HCAPTCHA_SITE_KEY)
  params.append('hcaptcha-token', hCaptchaToken)

  return fetch(APPROOV_WEB_PROTECT_URL, {
      method: 'POST',
      body: params
    })
    .then(response => {
      if (!response.ok) {
        console.debug('Approov token fetch failed: ', response)
        throw new Error('Failed to fetch an Approov Token') // reject with a throw on failure
      }

      return response.text() // return the token on success
    })
}
```

To fetch an Approov token we need an hCaptcha token which is passed as an argument to the `fetchHello` and `fetchShape` callbacks.

For example, when the user clicks the `SHAPE` button, the event will be handled by the hCaptcha script. If an hCaptcha token is obtained then it will be passed to the callback function, `fetchShape`. We need to ensure that the hCaptcha token makes it into the `fetchApproovToken` call and we do that by passing it through the intervening functions: `makeApiRequest` and `addRequestHeaders`.

Edit the file `shapes-app/unprotected/assets/js/app.js` to include the modified code for the following functions:

```javascript
function addRequestHeaders(hCaptchaToken) {
  return fetchApproovToken(hCaptchaToken)
    .then(approovToken => {
      return new Headers({
        'Accept': 'application/json',
        'Approov-Token': approovToken
      })
    })
}

function makeApiRequest(path, hCaptchaToken) {
  hideFromScreen()

  return addRequestHeaders(hCaptchaToken)
    .then(headers => fetch(API_BASE_URL + '/' + path, { headers: headers }))
    .then(response => handleApiResponse(response))
}

function fetchHello(hCaptchaToken) {
  makeApiRequest(API_VERSION + '/hello', hCaptchaToken)
    .then(data => {
      document.getElementById('start-app').classList.add("hidden")
      document.getElementById('hello').classList.remove("hidden")
    })
    .catch(error => handleApiError('Fetch from ' + API_VERSION + '/hello failed', error))
}

function fetchShape(hCaptchaToken) {
  makeApiRequest(API_VERSION + '/shapes', hCaptchaToken)
    .then(data => {

      if (data.status >= 400 ) {
        document.getElementById('confused').classList.remove("hidden")
        return
      }

      let node = document.getElementById('shape')
      node.classList.add('shape-' + data.shape.toLowerCase())
      node.classList.remove("hidden")
    })
    .catch(error => handleApiError('Fetch from ' + API_VERSION + '/shapes failed', error))
}
```

Note that, in the case you are migrating from an hCaptcha flow to an Approov flow, the changes are very minor. We would expect the same small changes to be required in your website at each point you construct requests that include an hCaptcha token. Depending on how your API calls are constructed, you may be able to make changes so that `fetchApproovToken` is called from a single point.

Before you can run the code it's necessary to obtain values for the placeholders, as described in the next section.

[TOC](#toc-table-of-contents)


## Approov Setup

To use Approov with hCaptcha in the web app we need a small amount of configuration.

### Configure the API Domain with Web Protection

First, we need to use the Approov CLI to register the API domain that will be protected and have it specifically enabled for [web protection](https://approov.io/docs/latest/approov-web-protection-integration/#enable-web-protection-for-an-api). Note that all web-protection domains are also able to serve tokens for the mobile channel. Run the following CLI command to add or update the configuration for the shapes API:

```text
approov api -add shapes.approov.io -allowWeb
```

### Register hCaptcha with Approov

To [configure](https://approov.io/docs/latest/approov-web-protection-integration/#configure-approov-with-an-hcaptcha-site) Approov with an hCaptcha site you must first [register](https://www.hcaptcha.com/signup-interstitial) with the hCaptcha service.

From the [hCaptcha Dashboard](https://dashboard.hcaptcha.com/sites?page=1) you can add a site and then copy the site key and the API key necessary to use the hCaptcha service.

If your site key and API key were `aaaaa12345` and `bbbbb12345` respectively then the command to register it with Approov would look like this:

```text
approov web -hCaptcha -add aaaaa12345 -secret bbbbb12345
```

When the hCaptcha token is passed to an Approov web-protection server for verification it, in turn, calls out to the hCaptcha servers before performing its checks on the result. The default check simply ensures that the result passes and issues a valid Approov token in that case. Further command line options can be used to control how Approov handles hCaptcha web protection, see the [docs](https://approov.io/docs/latest/approov-web-protection-integration/#configure-approov-with-an-hcaptcha-site) for details.

### Replace the Code Placeholders

The code we added for the integration of hCaptcha with Approov has some placeholders for which we now have values.

#### hCaptcha Site Key

Using the hCaptcha site key retrieved from the hCaptcha admin console we can now replace the `HCAPTCHA_SITE_KEY` directly in the code, or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___HCAPTCHA_SITE_KEY___|aaaaa12345|" ./shapes-app/unprotected/index.html
sed -i "s|___HCAPTCHA_SITE_KEY___|aaaaa12345|" ./shapes-app/unprotected/assets/js/app.js
```

On Windows you can do it with:

```text
get-content shapes-app\unprotected\index.html | %{$_ -replace "___HCAPTCHA_SITE_KEY___","aaaaa12345"}
get-content shapes-app/unprotected/assets/js/app.js | %{$_ -replace "___HCAPTCHA_SITE_KEY___","aaaaa12345"}

```

> **NOTE:** Replace the dummy hCaptcha site key `aaaaa12345` with your own one.

#### Approov Site Key

The Approov site key can be obtained with the following command:

```text
approov web -list
```

The Approov site key is the first `Site Key` in the output:

```text
Site Key: 123a4567-abcd-12e3-9z8a-9b1234d54321
Token Lifetime: 10 seconds
hCaptcha:
  Optional: true
  Site Key: aaaaa12345
    Min Score: 0.00
    Include IP: false
    Embed Result: false
```

Now, replace the placeholder `___APPROOV_SITE_KEY___` directly in the code or from the command line.

On Linux and MACs you can use the `sed` command:

```text
sed -i "s|___APPROOV_SITE_KEY___|123a4567-abcd-12e3-9z8a-9b1234d54321|" ./shapes-app/unprotected/assets/js/app.js
```

On Windows you can do it with:

```text
get-content shapes-app\unprotected\index.html | %{$_ -replace "___APPROOV_SITE_KEY___","123a4567-abcd-12e3-9z8a-9b1234d54321"}
```

> **NOTE:** Replace the dummy Approov site key `123a4567-abcd-12e3-9z8a-9b1234d54321` with your own one.

[TOC](#toc-table-of-contents)


## RUNNING THE SHAPES WEB APP WITH APPROOV AND HCAPTCHA

Now that we have completed the integration of hCaptcha with Approov into the unprotected Shapes web app, it's time to test it again.

Refresh the browser with `ctrl + F5` and then click on the `SHAPES` button and this time, instead of a bad request, we should get a shape:

<p>
  <img src="/readme-images/protected-v2-shape-page.png" width="480" title="Shapes protected web app Shape page">
</p>

[TOC](#toc-table-of-contents)


## WHAT IF I DON'T GET SHAPES

This can be due to a lot of different causes, but usually is due to a typo, missing one of the steps or executing one of the steps incorrectly, but we will take you through the most probable causes.

### Browser Developer Tools

Open the browser developer tools and check if you can see any errors in the console.

If you find errors related with the `app.js` file then fix them and try again, but always remember to refresh the browser with `ctrl + F5` after updating a Javascript file.

If during `localhost` development you see `CORS` errors for any `hcatpcha` domain then follow their [instructions](https://docs.hcaptcha.com/#local-development) for local development.

### hCaptcha Script

In `shapes-app/unprotected/index.html`, check that you are correctly:

* loading the hCaptcha SDK after the closing `</title>` tag.
* adding the required attributes to the `<button ...>` HTML tag

### hCaptcha Site key

Check that you are using the correct hCaptcha site key in `index.html` and `app.js` files:
* the placeholder `___HCAPTCHA_SITE_KEY___` has been replaced
* the site key doesn't have a typo

### Approov Site Key

Check that you are using the correct Approov site key:
* the placeholder `___APPROOV_SITE_KEY___` has been replaced
* the Approov site key doesn't have a typo

### Shapes API Domain

Check that you have added the the `shapes.approov.io` API registered in your account. Use the following Approov CLI command and ensure the API is listed with web protection enabled.

```text
approov api -list
```

### Approov hCaptcha Site Registration

Check that you have correctly registered your hCaptcha site with the Approov CLI:

```text
approov web -hcaptcha -list
```

The output should look like this:

```text
Optional: true
Site Key: aaaaa12345
  Min Score: 0.00
  Include IP: false
  Embed Result: false
```

If the hCaptcha site key is correct, then the next step is to check the hCaptcha API key. For security reasons the Approov CLI never outputs or returns the API key after it is set. To ensure the value is correct you can just re-register the site using [the same CLI command](#register-hcaptcha-with-approov) and it will overwrite the entries.

### Approov Live Metrics

Use the Approov CLI to see the [Live Metrics](https://approov.io/docs/latest/approov-usage-documentation/#live-metrics) and identify the cause of the failure.

```text
approov metrics
```

This will open your Approov Grafana metrics homepage. From there you can select the "Live Metrics" dashboard which includes web-protection request metrics updated every minute (max 2 mins for a request to be visible).

### Approov Web Protection Server Errors

If the Approov web protection server is unable to complete a request then it will respond with an error.

See [here](https://approov.io/docs/latest/approov-web-protection-integration/#troubleshooting-web-protection-errors) the complete list of possible errors that can be returned by the Approov web protection server.

If the error is not displayed in the web page you may need to open the browser developer tools and inspect the json response payload for the request made to the Approov web protection server.

### Debug the Approov Token

The Approov CLI can check Approov token validity and display the claims.

Open the browser developers tools and from the network tab grab the Approov token from the request header `Approov-Token` and then check it with:

```text
approov token -check <approov-token-here>
```

In the output of the above command look for the [embed](https://approov.io/docs/latest/approov-web-protection-integration/#approov-embed-token-claim-for-hCaptcha) claim that contains the response details for the hCaptcha token.

Example of an Approov web protection token containing an `embed` claim with partial hCaptcha results:

```json
{
  "exp": 1622476181,
  "ip": "1.2.3.4",
  "embed": {
    "hcap:aaaaa12345": {
      "challenge_ts": "2021-06-04T17:36:07.000000Z",
      "hostname": "example.com"
    }
  }
}
```

(The output of the Approov CLI is not formatted as above.)

> **NOTE:** You can get the full results from hCaptcha verification if your API uses encrypted tokens and you specify `-embedResult` when you configure the hCaptcha site with the Approov CLI

[TOC](#toc-table-of-contents)


## CHANGING YOUR OWN WEB APP TO USE APPROOV

This quick start guide has taken you through the steps of adding hCaptcha into Approov in the shapes demonstration web app.

You can follow the same approach to add Approov with hCaptcha into your own web app.

### API Domains

Remember to do an audit of your API to check which end-points should be enabled for web access. When necessary, extend the backend token check to differentiate between mobile app and web app tokens and use that to restrict the access to more sensitive end-points. Once the backend is ready, enable the Approov web protection by adding the `-allowWeb` flag whenever you [register or re-register](https://approov.io/docs/latest/approov-usage-documentation/#enable-web-protection-for-an-api) an API with the Approov CLI.

### Changing Your API Backend

The Shapes example app uses the API endpoint `https://shapes.approov.io/v2/shapes` hosted on Approov's servers and you can see the code for it in this [Github repo](https://github.com/approov/quickstart-nodejs-koa_shapes-api).

If you want to integrate Approov into your own web app you will need to [integrate](https://approov.io/docs/latest/approov-usage-documentation/#backend-integration) an Approov token check in the backend. Since the Approov token is simply a standard [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) this is usually straightforward.

Check the [Backend integration](https://approov.io/docs/latest/approov-integration-examples/backend-api/) examples that provide a detailed walk-through for specific programming languages and frameworks.

[TOC](#toc-table-of-contents)


## CONTENT SECURITY POLICY

In the `content-src` policy of your current web app you will need to add the domains for Approov:

```text
connect-src https://your-domains.com https://web-1.approovr.io/;
```

hCaptcha works with an `iframe` therefore you need to allow it with:

```text
frame-src https://newassets.hcaptcha.com/captcha/;
```

Finally, add the static and dynamic hCaptcha scripts to your script-src policy:

```text
script-src 'self' https://hcaptcha.com/1/api.js https://newassets.hcaptcha.com/captcha/;
```

You can check the Content Security Policy for your site [here](https://csp-evaluator.withgoogle.com/) or testing it in conjunction with all the other security headers [here](https://securityheaders.com).

[TOC](#toc-table-of-contents)


## NEXT STEPS

If you wish to explore the Approov solution in more depth, then why not try one of the following links as a jumping off point:

* [Approov Free Trial](https://approov.io/signup) (no credit card needed)
* [Approov QuickStarts](https://approov.io/docs/latest/approov-integration-examples/)
* [Approov Blog](https://blog.approov.io)
* [Approov Docs](https://approov.io/docs)
  * [Metrics Graphs](https://approov.io/docs/latest/approov-usage-documentation/#metrics-graphs)
  * [Security Policies](https://approov.io/docs/latest/approov-usage-documentation/#security-policies)
  * [Manage Devices](https://approov.io/docs/latest/approov-usage-documentation/#managing-devices)
  * [Service Monitoring](https://approov.io/docs/latest/approov-usage-documentation/#service-monitoring)
  * [Automated Approov CLI Usage](https://approov.io/docs/latest/approov-usage-documentation/#automated-approov-cli-usage)
  * [SafetyNet Integration](https://approov.io/docs/latest/approov-usage-documentation/#google-safetynet-integration)
  * [Account Management](https://approov.io/docs/latest/approov-usage-documentation/#user-management)
* [Approov Resources](https://approov.io/resource/)
* [Approov Customer Stories](https://approov.io/customer)
* [About Us](https://approov.io/company)
* [Contact Us](https://approov.io/contact)

[TOC](#toc-table-of-contents)
