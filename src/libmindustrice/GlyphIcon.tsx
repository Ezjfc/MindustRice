/**
 * @see GlyphIcon
 */

import GObject from "gnim/gobject"
import PixelImage from "./PixelImage"
import { appearenceToCss, PostInitHookParameters } from "./component"
import Gtk from "gi://Gtk?version=4.0"
import { $ } from "gnim-hooks"

/**
 * Parameters of a glyph icon component. Icons exist in the form of flag options and only one can
 *            be set at a time.
 *
 * TODO: use Nix to generate
 */
export type Parameters = BaseParameters & (
  {
    iconUpOpen: boolean
  }|{
    iconDownOpen: boolean
  }
)

/**
 * BaseParameters of a glyph icon component.
 */
export interface BaseParameters extends PostInitHookParameters<Gtk.Label> {
  appearence?: $<Appearence>
}

/**
 * Appearence of a glyph icon component.
 */
export interface Appearence {
  /**
   * fontSize controls the size of the text and placeholder.
   * @default 18
   */
  fontSize?: string
  /**
   * textColour is for the editable text in the entry.
   */
  textColour?: string
}

/**
 * GlyphIcon is an icon that are embeded into the font files instead of being a discrete image.
 *           This should only be used when the image version is not available as glyph icons will
 *           blur when scales up.
 *
 * @see {@link PixelImage}
 */
export default function GlyphIcon({
  appearence,
  $: postInitHook,
  ...passthrus
}: Parameters) : GObject.Object {
  return (
    <Gtk.Label
      $={postInitHook}
      class="glyphIcon"
      css={appearence ? appearenceToCss("glyphIcon", appearence) : undefined}
      label={flagToChar(passthrus)}
    />
  )
}

/**
 * flagToChar returns the character if the icons based on their flag.
 */
export function flagToChar(passthrus: object) : string {
  const isIcon = (name: string) => `icon${name}` in passthrus

  if (isIcon("UpOpen")) {
    return "\ue826"
  }
  if (isIcon("DownOpen")) {
    return "\ue824"
  }

  throw new Error("unknown glyph icon")
}
