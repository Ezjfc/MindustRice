/**
 * @see CentralBanner
 */

import Gtk from "gi://Gtk?version=4.0";
import GObject from "gnim/gobject";
import { PostInitHookParameters } from "../component";

/**
 * Parameters of a opening central banner component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Box> {
  /**
   * children is the tree of elements inside the opening background.
   */
  children?: GObject.Object
}

/**
 * CentralBanner mimics the central banner in the opening (start screen) of the original game.
 */
export default function CentralBanner({ children, ...passthrus }: Parameters) : GObject.Object {
  return (
    <Gtk.Box orientation={Gtk.Orientation.VERTICAL}>
      <Gtk.Box vexpand />
      <Gtk.Box class="centralBanner" hexpand heightRequest={120} {...passthrus} >
      {children}
      </Gtk.Box>
      <Gtk.Box vexpand />
    </Gtk.Box>
  )
}
