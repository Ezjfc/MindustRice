/**
 * @see Resizer
 */

import Gtk from "gi://Gtk?version=4.0"
import { createState } from "gnim"
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
  const [height, setHeight] = createState(defaultHeight ?? 40)
  const [width, setWidth] = createState(defaultWidth ?? 500)

  let stableHeight = height.peek()
  let stableWidth = width.peek()

  return (
    <Gtk.ScrolledWindow vscrollbarPolicy={Gtk.PolicyType.NEVER} >
      <Gtk.Box class="preview-drag-area" >
        <Gtk.GestureDrag onDragBegin={() => {
          stableHeight = height.peek()
          stableWidth = width.peek()
        }} onDragUpdate={(self, offsetX, offsetY) => {
          setHeight(Math.max(stableHeight + offsetY, 1))
          setWidth(Math.max(stableWidth + offsetX, 1))
        }} />
        <Gtk.Box hexpand={false} heightRequest={height} widthRequest={width}>
        {children}
        </Gtk.Box>
      </Gtk.Box>
    </Gtk.ScrolledWindow>
  )
}
