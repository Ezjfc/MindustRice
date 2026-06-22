/**
 * @see OPBackground
 */

import Gtk from "gi://Gtk?version=4.0";
import GObject from "gnim/gobject";

/**
 * Parameters of a opening background component.
 */
export interface Parameters {
  /**
   * content is the child elements tree inside the opening background.
   */
  content?: GObject.Object
}

/**
 * OPBackground mimics the background grid pattern in the opening (start screen) of the original
 *              game.
 */
export default function OPBackground({ content, ...passthrus }: Parameters) : GObject.Object {
  return (
    <Gtk.Box class="opBackground" vexpand={true} hexpand={true} >{content}</Gtk.Box>
  )
      // <Gtk.Box>
      // </Gtk.Box>
}
