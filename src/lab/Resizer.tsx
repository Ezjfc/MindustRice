/**
 * @see Resizer
 */

import Gtk from "gi://Gtk?version=4.0"
import GObject from "gnim/gobject"

/**
 * Parameters of a resizer component.
 */
export interface Parameters {
  children: GObject.Object,
  defaultWidth?: number,
  defaultHeight?: number,
}

/**
 * Resizer allows the previewing component to be resized freely.
 */
export default function Resizer({ children, defaultWidth, defaultHeight }: Parameters) : GObject.Object {
  defaultWidth = defaultWidth ?? 500
  defaultHeight = defaultHeight ?? 40

  const init = (self: Gtk.Box) => {
    // self.set_layout_manager(new Gtk.ConstraintLayout())
  }

  return (
    <Gtk.Box $={init} heightRequest={defaultHeight} vexpand >
    {children}
    </Gtk.Box>
  )
}

