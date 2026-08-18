/**
 * Public configuration for the static inquiry client.
 *
 * The Apps Script deployment URL is not a credential, but keeping it here makes
 * replacement and deployment review straightforward. Paste the production
 * `/exec` URL below after deploying the Apps Script Web App.
 */
export const commissionBackend = Object.freeze({
  appsScriptEndpointUrl: "https://script.google.com/macros/s/AKfycbyxFDs0T1rCDAncfmPMSfVkaVKvDr2EsROx9mzpo-aWkMXdNGxb-_ozMMpLZ88MwM1t/exec",
  frontendVersion: "commission-form-v3",
  source: "houseadel.com",
  minimumCompletionMs: 2_500,
});

export function hasConfiguredCommissionEndpoint() {
  try {
    const url = new URL(commissionBackend.appsScriptEndpointUrl);
    return url.protocol === "https:" &&
      url.hostname === "script.google.com" &&
      url.pathname.endsWith("/exec");
  } catch {
    return false;
  }
}
