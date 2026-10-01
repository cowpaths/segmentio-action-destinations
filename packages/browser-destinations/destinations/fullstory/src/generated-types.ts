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
   * Enables Fullstory inside an iframe.
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
}
