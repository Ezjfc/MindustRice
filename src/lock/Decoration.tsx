/**
 * @see Decoration
 */

import GObject from "gnim/gobject"
import { PostInitHookParameters } from "../libmindustrice/component"
import Gtk from "gi://Gtk?version=4.0"
import OPBackground, { Parameters as OPBackgroundParameters } from "../libmindustrice/opening/OPBackground"
import Entry from "../libmindustrice/menu/Entry"
import CentralBanner from "../libmindustrice/opening/CentralBanner"

/**
 * Parameters of a (lockscreen) decoration component.
 */
export interface Parameters extends OPBackgroundParameters {
}

/**
 * Decoration is a visible layer to be displayed on all monitors when the session is locked.
 */
export default function Decoration({ ...passthrus }: Parameters) : GObject.Object {
  return (
    <OPBackground {...passthrus} >
      <CentralBanner />
    </OPBackground>
  )
}
