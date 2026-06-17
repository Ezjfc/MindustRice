/**
 * @see FitEntry
 */

import { Accessor, createBinding, createEffect } from "gnim";
import GObject from "gnim/gobject";
import Entry, { Parameters as EntryParameters } from "./Entry";
import Gtk from "gi://Gtk?version=4.0";

/**
 * Parameters of a fit entry component.
 */
export interface Parameters extends EntryParameters {
  /**
   * fitToText enables the fitting behaviour when the entry has text. When disabled, it will expand
   *           horizontally when the entry has text.
   * @default true
   */
  fitToText?: boolean|Accessor<boolean>
  /**
   * fitToPlaceholder enables the fitting behaviour when placeholder is visible (when the entry has
   * no text). When disabled, it will expand horizontally when the placeholder is visible.
   * @default true
   */
  fitToPlaceholder?: boolean|Accessor<boolean>
}

/**
 * FitEntry is an {@link Entry} that automatically fits to its content or placeholder.
 *
 * Visual documentation:
 */
export default function FitEntry(params: Parameters) : GObject.Object {
    const { fitToText, fitToPlaceholder } = params

    const entry = <Entry /> as Gtk.Entry
    const getText = createBinding(entry, "text")
    const getPlaceholder = createBinding(entry, "placeholderText").as(p => p || "")
    const init = ({}) => createEffect(() => {
      const text = getText()
      let option: boolean|Accessor<boolean>|undefined
      let content: string
      if (text !== "") {
        option = fitToText
        content = getText()
      } else {
        option = fitToPlaceholder
        content = getPlaceholder()
      }

      if (option instanceof Accessor) {
        // TODO: extremely speghetti sounds like I really need gnim hooks
        option = option()
      }

      handleFitOption(entry, option || true, content)
    })

    return <box $={init}>{entry}</box>
}

/**
 * handleFitOption checks if the given option is enabled. When enabled, it will disable horizontal
 *                 expand and updates the width request to fit with the content. Otherwise, it will
 *                 enable horizontal expand.
 */
function handleFitOption(widget: Gtk.Widget, enabled: boolean, content: string) {
  if (!enabled) {
    widget.hexpand = true
  }

  widget.hexpand = false
  widget.widthRequest = getEntryWidth(widget, content)
}

/**
 * ENTRY_PADDING_PIXELS is added on top of the raw text size in getEntryWidth.
 */
const ENTRY_PADDING_PIXELS = 16;

/**
 * getEntry calculates the width of a single-line text in an entry component.
 */
function getEntryWidth(widget: Gtk.Widget, text: string) : number {
  const layout = widget.create_pango_layout(text)
  const [w] = layout.get_pixel_size()
  return w + ENTRY_PADDING_PIXELS
}
