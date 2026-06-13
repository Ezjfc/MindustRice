/**
 * utils holds utility code for the lab program.
 */

import Gtk from "gi://Gtk?version=4.0";

/**
 * ENTRY_PADDING_PIXELS should be added to getTextWidth when the widget is an entry.
 *
 * @deprecated due to being a temporary constant. This should be merged into getTextWidth once the
 *             behaviour is confirmed.
 */
export const ENTRY_PADDING_PIXELS = 16;

/**
 * getTextWidth calculates the width of a one-liner text. This is useful for making an entry or label
 *              that fits to content.
 */
export function getTextWidth(widget: Gtk.Widget, text: string) : number {
  const layout = widget.create_pango_layout(text)
  const [w] = layout.get_pixel_size()
  return w
}
