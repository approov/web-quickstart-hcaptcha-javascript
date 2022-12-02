// See the Dockerfile for how place holders in config.js are replaced during the Docker image build.
import { SHAPES_API_KEY } from "/config.js"

window.addEventListener('load', (event) => {
  const navbar = document.getElementById('toggle-navbar')
  navbar.addEventListener('click', (event) => toggleNavbar('example-collapse-navbar'))
})

const API_VERSION = "v1"
const API_DOMAIN = "shapes.approov.io"
const API_BASE_URL = "https://" + API_DOMAIN

function addRequestHeaders(hCaptchaToken) {
  return new Promise(function(resolve, reject) {
    resolve(
      new Headers({
        'Accept': 'application/json',
        'Api-Key': SHAPES_API_KEY,
        'Hcaptcha-Token': hCaptchaToken
      })
    )
  })
}

function makeApiRequest(path, hCaptchaToken) {
  hideFromScreen()

  return addRequestHeaders(hCaptchaToken)
    .then(headers => fetch(API_BASE_URL + '/' + path, { headers: headers }))
    .then(response => handleApiResponse(response))
}

window.fetchHello = function fetchHello(hCaptchaToken) {
  makeApiRequest(API_VERSION + '/hello', hCaptchaToken)
    .then(data => {
      document.getElementById('start-app').classList.add("hidden")
      document.getElementById('hello').classList.remove("hidden")
    })
    .catch(error => handleApiError('Fetch from ' + API_VERSION + '/hello failed', error))
}

window.fetchShape = function fetchShape(hCaptchaToken) {
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

function handleApiResponse(response) {
  document.getElementById('spinner').classList.add("hidden")

  if (!response.ok) {
    console.debug('Error Response', response)
    console.debug('Error Response Body Text', response.text())
    throw new Error(response.status + ' ' + response.statusText)
  }

  document.getElementById('success').classList.remove("hidden")

  return response.json();
}

function handleApiError(message, error) {
  document.getElementById('spinner').classList.add("hidden")

  console.debug(message, error)

  let node = document.getElementById('confused')
  node.lastChild.innerHTML = error
  node.classList.remove("hidden")
}

function hideFromScreen() {
  document.getElementById('start-app').classList.add("hidden");
  document.getElementById('confused').classList.add("hidden");
  document.getElementById('hello').classList.add("hidden");
  document.getElementById('shape').className = "hidden"
  document.getElementById('success').className = "hidden"
  document.getElementById('spinner').classList.remove("hidden")
}

function toggleNavbar(collapseID) {
  document.getElementById(collapseID).classList.toggle("hidden");
  document.getElementById(collapseID).classList.toggle("block");
}
