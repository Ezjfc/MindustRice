/**
 * @see FitEntry
 */

import { createBinding, createEffect } from "gnim";
import GObject from "gnim/gobject";
import Entry, { Parameters as EntryParameters } from "./Entry";
import Gtk from "gi://Gtk?version=4.0";
import { $ } from "gnim-hooks";

/**
 * Parameters of a fit entry component.
 */
export interface Parameters extends EntryParameters {
  /**
   * fitToText enables the fitting behaviour when the entry has text. When disabled, it will expand
   *           horizontally when the entry has text.
   * @default true
   */
  fitToText?: $<boolean>
  /**
   * fitToPlaceholder enables the fitting behaviour when placeholder is visible (when the entry has
   *                  no text). When disabled, it will expand horizontally when the placeholder is
   *                  visible.
   * @default true
   */
  fitToPlaceholder?: $<boolean>
}

/**
 * FitEntry is an {@link Entry} that automatically fits to its content or placeholder.
 *
 * Visual documentation: TODO
 */
export default function FitEntry({
  fitToText,
  fitToPlaceholder,
  $: postInitHook,
  ...passthrus
}: Parameters) : GObject.Object {
  fitToText = fitToText ?? true
  fitToPlaceholder = fitToPlaceholder ?? true

  return (
    <Entry
      $={(self) => {
        initFitEntry(fitToText, fitToPlaceholder)(self)
        if (postInitHook) postInitHook(self)
      }}
      {...passthrus}
    />
  )

}

/**
 * initFitEntry returns an initialiser that converts an entry to fit entry.
 */
export function initFitEntry(fitToText: $<boolean>, fitToPlaceholder: $<boolean>) {
  return (self: Gtk.Entry) => {
    const getText = createBinding(self, "text")
    const getPlaceholder = createBinding(self, "placeholderText").as(p => p ?? "")
    const getFitToText = $(fitToText)
    const getFitToPlaceholder = $(fitToPlaceholder)

    createEffect(() => {
      const text = getText()
      if (text !== "") {
        handleFitOption(self, getFitToText(), text)
      } else {
        handleFitOption(self, getFitToPlaceholder(), getPlaceholder())
      }

    })
  }
}

/**
 * handleFitOption will disable horizontal expand and updates the width request to fit with the
 *                 content if the currently active option is enabled. Otherwise, it will enable
 *                 horizontal expand.
 */
function handleFitOption(widget: Gtk.Widget, enabled: boolean, content: string) {
  if (!enabled) {
    widget.hexpand = true
    return
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
