import type { BrowserActionDefinition } from '@segment/browser-destination-runtime/types'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import type { FS } from '../types'

const action: BrowserActionDefinition<Settings, FS, Payload> = {
  title: 'Start Capture',
  description:
    "Starts Fullstory capture by calling `FS('start')`. Use this with the Start capture manually setting to begin capture on an event of your choosing, such as when a user grants consent. It has no effect if capture has already started.",
  platform: 'web',
  fields: {},
  perform: (FS) => {
    FS('start')
  }
}

export default action
