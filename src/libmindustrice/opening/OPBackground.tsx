/**
 * @see OPBackground
 */

import Gtk from "gi://Gtk?version=4.0";
import GObject from "gnim/gobject";
import { PostInitHookParameters } from "../component";

/**
 * Parameters of a opening background component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Overlay> {
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
    <Gtk.Overlay>
      {children}
      <Gtk.Box $type="overlay" class="opBackground" vexpand={true} hexpand={true} />
    </Gtk.Overlay>
  )
}
