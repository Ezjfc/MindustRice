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
export default function GlyphIcon({ appearence, ...passthrus }: Parameters) : GObject.Object {
  return (
    <Gtk.Label
      class="glyphIcon"
      css={appearence ? appearenceToCss("glyphIcon", appearence) : undefined}
      label={flagToChar(passthrus)}
      {...passthrus}
    />
  )
}

/**
 * flagToChar modifies passthrus to set all icon flags to undefined before returning the character
 *            of the icons based on their flag.
 */
export function flagToChar(passthrus: Record<string, unknown>) : string {
  const matchAndClean = (name: string) => {
    const key = `icon${name}`
    if (key in passthrus) {
      passthrus[key] = undefined
      return true
    }

    return false
  }

  if (matchAndClean("UpOpen")) {
    return "\ue826"
  }
  if (matchAndClean("DownOpen")) {
    return "\ue824"
  }

  throw new Error("unknown glyph icon")
}
