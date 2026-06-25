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
   * children is the tree of elements inside the opening background.
   */
  children?: GObject.Object
}

/**
 * OPBackground mimics the background grid pattern in the opening (start screen) of the original
 *              game.
 */
export default function OPBackground({ children, ...passthrus }: Parameters) : GObject.Object {
  return (
    <Gtk.Box class="opBackground" vexpand={true} hexpand={true} >{children}</Gtk.Box>
  )
      // <Gtk.Box>
      // </Gtk.Box>
}
