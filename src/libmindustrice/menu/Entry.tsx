/**
 * @see Entry
 */

import { $ } from "gnim-hooks";
import GObject from "gnim/gobject";
import { appearenceToCss, PostInitHookParameters } from "../component";
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
  /**
   * appearence controls the generation of dynamic CSS.
   */
  appearence?: $<Appearence>
}

/**
 * Appearence of an entry component, which includes a set of mutually exclusive options controlling
 *            the underline of the component.
 */
export type Appearence = AppearenceOfUnderline|AppearenceOfNoUnderline

/**
 * BaseAppearence of an entry component.
 */
export interface BaseAppearence {
  /**
   * font is the font family.
   * @default audiowide
   */
  font?: string
  /**
   * fontSize controls the size of the text and placeholder.
   * @default 28
   */
  fontSize?: string

  /**
   * textColour is for the editable text in the entry.
   */
  textColour?: string
  /**
   * textShadowColour is the colour of the shadow of the editable text.
   *                  Placeholder does not have a shadow.
   * @default #454545
   */
  textShadowColour?: string

  /**
   * selectionHighlight is the colour of a selection.
   * @default rgba(255, 255, 255, 0.5)
   */
  selectionHighlight?: string
  /**
   * selectionTextColour is the colour of the editable text when it is being selected.
   * @default white
   */
  selectionTextColour?: string
}

/**
 * AppearenceOfUnderline holds appearence options of an entry component where the underline is
 *                       visible and can be styled.
 */
export interface AppearenceOfUnderline extends BaseAppearence {
  /**
   * noUnderline when not set or set to false, allows underline parameters to co-exist. When set to
   *             true, will hide the underline alongside disabling its padding.
   *
   * The same effects may be achieved by managing those options manually. However, using this
   * option can ensure safety and convenience.
   *
   * REMINDER: when this option is set to true, it will conflict with some options!
   */
  noUnderline?: false
  /**
   * underlinePadding represents the bottom padding.
   * @default 10px
   */
  underlinePadding?: string
  /**
   * underlineColour is the colour of the underline.
   * @default #454545
   */
  underlineColour?: string
  /**
   * underlineThickness controls how thick the underline is.
   * @default 3px
   */
  underlineThickness?: string
}

/**
 * AppearenceOfNOUnderline holds appearence options of an entry component where the underline will
 *                         not be visible.
 */
export interface AppearenceOfNoUnderline extends BaseAppearence {
  /**
   * noUnderline when not set or set to false, allows underline parameters to co-exist. When set to
   *             true, will hide the underline alongside disabling its padding.
   *
   * The same effects may be achieved by managing those options manually. However, using this
   * option can ensure safety and convenience.
   *
   * REMINDER: when this option is set to true, it will conflict with some options!
   */
  noUnderline: true
}

/**
 * Entry mimics the text entry in common menus of the original game.
 *
 * Visual documentation: TODO
 */
export default function Entry({ appearence, ...pasthrus }: Parameters) : GObject.Object {
    let css: $<string>|undefined
    if (appearence) css = appearenceToCss("entry", $(appearence).as(handleUnderline))

    return (
      <Gtk.Entry
        css={css}
        class="entry"
        {...pasthrus}
      />
    )
}

/**
 * handleUnderline processes the appearence options related to the underline of an entry component.
 */
function handleUnderline(appearence: Appearence) : AppearenceOfUnderline {
  if (appearence.noUnderline) {
    appearence = {
      ...appearence,
      noUnderline: false,
      underlineThickness: "0px",
      underlinePadding: "0px",
    } as AppearenceOfUnderline
  }

  appearence.noUnderline = undefined
  return appearence
}
