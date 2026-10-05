// Generated file. DO NOT MODIFY IT BY HAND.

export interface Settings {
  /**
   * The organization ID for Fullstory.
   */
  orgId: string
  /**
   * Enables Fullstory debug mode.
   */
  debug?: boolean
  /**
   * Makes this iFrame the root of its own recording, as its own session. Use this when your app is embedded in an iFrame on a site that does not run Fullstory, or when you want its content sent to a different Fullstory org.
   */
  recordOnlyThisIFrame?: boolean
  /**
   * The domain of the web capture server host. Can be set to direct captured events to a [Fullstory Custom Endpoint](https://help.fullstory.com/hc/en-us/articles/18612999473175-How-to-send-captured-traffic-to-your-First-Party-Domain-using-Custom-Endpoints) or a proxy that you host. Defaults to 'fullstory.com', or the region-specific equivalent (for example 'eu1.fullstory.com') when the Org ID carries a region suffix.
   */
  host?: string
  /**
   * The base URL of the Fullstory application, used when generating and displaying session URLs. Only set this if you need a value other than a Fullstory URL, which is rarely the case. Leave blank to use the default for your Org ID.
   */
  appHost?: string
  /**
   * Optionally specify a custom Fullstory script URL. Useful if you are using a proxy. The default is 'edge.fullstory.com/s/fs.js', or the region-specific equivalent (for example 'edge.eu1.fullstory.com/s/fs.js') when the Org ID carries a region suffix.
   */
  script?: string
  /**
   * Lets Fullstory record this page when it runs inside a cross-domain iFrame. Fullstory must also run in the parent page. Understand the [security implications](https://help.fullstory.com/hc/en-us/articles/360020622514-Can-Fullstory-capture-content-that-is-presented-in-iframes) and configure your Content Security Policy frame-ancestors directive before enabling.
   */
  recordCrossDomainIFrames?: boolean
  /**
   * When enabled, Fullstory loads but waits for a call to `FS('start')` before it begins capturing. See [Manually Delay Data Capture](https://developer.fullstory.com/browser/v2/auto-capture/capture-data/#manually-delay-data-capture).
   */
  startCaptureManually?: boolean
  /**
   * Overrides the domain the Fullstory cookie is valid for. By default the cookie is valid for all subdomains of your site; set this to limit it to a specific subdomain. See [Can the Fullstory cookie be associated with a specific subdomain?](https://help.fullstory.com/hc/en-us/articles/360020622874-Can-the-Fullstory-cookie-be-associated-with-a-specific-subdomain)
   */
  cookieDomain?: string
  /**
   * Sets the current asset map ID. Only needed if you upload assets to Fullstory. See [Asset Uploading for Web](https://help.fullstory.com/hc/en-us/articles/4404129191575-Asset-Uploading-for-Web).
   */
  assetMapId?: string
  /**
   * Sets the session UID passed to the Fullstory init operation. This option is in beta.
   */
  sessionUid?: string
}
