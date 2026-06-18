/**
 * @see Entry
 */

import { $ } from "gnim-hooks";
import GObject from "gnim/gobject";

/**
 * Parameters of an entry component.
 */
export interface Parameters {
  /**
   * text is the editable content.
   * @efault ""
   */
  text?: $<string>
  /**
   * placeholderText is the non-editable content when text is empty.
   * @default ""
   */
  placeholderText?: $<string>
  /**
   * onNotifyText is called when text updates.
   */
  onNotifyText?: (data: { text: string }) => void
}

/**
 * Entry mimics the text entry in common menus of the original game.
 *
 * Visual documentation: TODO
 */
export default function Entry({
  text,
  placeholderText,
  onNotifyText
}: Parameters) : GObject.Object {
    return <entry
      class="entry"
      text={text || ""}
      placeholderText={placeholderText || ""}
      onNotifyText={onNotifyText}
      />
}
