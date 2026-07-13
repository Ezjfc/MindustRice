/**
 * @see Resizer
 */

import Gtk from "gi://Gtk?version=4.0"
import { Accessor, Setter } from "gnim"
import GObject from "gnim/gobject"
import { PostInitHookParameters } from "../libmindustrice/component"

/**
 * Parameters of a resizer component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Box> {
  children: GObject.Object
  width: Accessor<number>
  height: Accessor<number>
  setWidth: Setter<number>
  setHeight: Setter<number>
}

/**
 * Resizer allows the previewing component to be resized freely.
 *
 * Top to bottom DOM explanations:
 * - Gtk.Box: prevents overlays from overflowing vertically, such as the options pane.
 * - Gtk.ScrolledWindow: prevents the right-aligned elements to overflow horizontally, such as the
 *   toolbar and options pane.
 * - Gtk.Box: gives a little margin between the component and horizontal scrollbar.
 * - Gtk.GestureDrag: handle cursor drags.
 * - Gtk.Box: sizes the component.
 * - children: the component.
 */
export default function Resizer({
  children,
  width,
  height,
  setWidth,
  setHeight,
  ...passthrus
}: Parameters) : GObject.Object {
  let stableWidth = width.peek()
  let stableHeight = height.peek()

  return (
    <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
      <Gtk.ScrolledWindow vscrollbarPolicy={Gtk.PolicyType.NEVER} hexpand>
        <Gtk.Box class="preview-drag-area" >
          <Gtk.GestureDrag onDragBegin={() => {
            stableWidth = width.peek()
            stableHeight = height.peek()
          }} onDragUpdate={(self, offsetX, offsetY) => {
            setWidth(Math.max(0, stableWidth + offsetX))
            setHeight(Math.max(0, stableHeight + offsetY))
          }} />
          <Gtk.Box hexpand={false} vexpand={false} heightRequest={height} widthRequest={width} {...passthrus} >
          {children}
          </Gtk.Box>
        </Gtk.Box>
      </Gtk.ScrolledWindow>
    </Gtk.Box>
  )
}
