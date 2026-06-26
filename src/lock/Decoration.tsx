/**
 * @see Decoration
 */

import GObject from "gnim/gobject"
import { PostInitHookParameters } from "../libmindustrice/component"
import Gtk from "gi://Gtk?version=4.0"
import OPBackground from "../libmindustrice/opening/OPBackground"
import Entry from "../libmindustrice/menu/Entry"

/**
 * Parameters of a (lockscreen) decoration component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Box> {
}

/**
 * Decoration is a visible layer to be displayed on all monitors when the session is locked.
 */
export default function Decoration({ $: postInitHook }: Parameters) : GObject.Object {
  return (
    <OPBackground>
      <Entry />
    </OPBackground>
  )
}
