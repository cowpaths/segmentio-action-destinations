/**
 * A FullStory data region.
 */
interface Region {
  label: string
  value: string
  baseUrl: string
}

/**
 * Supported FullStory data regions.
 */
export const dataRegions: Record<string, Region> = {
  north_america: {
    label: 'North America',
    value: 'north_america',
    baseUrl: 'https://api.fullstory.com'
  },
  europe: {
    label: 'Europe',
    value: 'europe',
    baseUrl: 'https://api.eu1.fullstory.com'
  }
}
