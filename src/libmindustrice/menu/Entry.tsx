/**
 * @see Entry
 */

import { $ } from "gnim-hooks";
import GObject from "gnim/gobject";
import { PostInitHookParameters } from "../component";
import Gtk from "gi://Gtk?version=4.0";

/**
 * Parameters of an entry component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Entry> {
  /**
   * text is the editable content.
   */
  text?: $<string>
  /**
   * placeholderText is the non-editable content when text is empty.
   */
  placeholderText?: $<string>
}

/**
 * Underline controls how the underline looks.
 */
export type Underline = {
  /**
   * noUnderline when not set or set to false, allows underline parameters to co-exist. When set to
   *             true, will hide the underline alongside disabling its padding.
   *
   * The same effects may be achieved by managing those options manually. However, using this
   * option can ensure safety and convenience.
   */
  noUnderline: true
}|{
  /**
   * noUnderline when not set or set to false, allows underline parameters to co-exist. When set to
   *             true, will hide the underline alongside disabling its padding.
   *
   * The same effects may be achieved by managing those options manually. However, using this
   * option can ensure safety and convenience.
   */
  noUnderline?: false
}

/**
 * Entry mimics the text entry in common menus of the original game.
 *
 * Visual documentation: TODO
 */
export default function Entry({
  $: postInitHook,
  ...pasthrus
}: Parameters) : GObject.Object {
    return (
      <Gtk.Entry
        $={postInitHook}
        class="entry"
        {...pasthrus}
      />
    )
}
