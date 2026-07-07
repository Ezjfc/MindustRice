/**
 * @see Decoration
 */

import GObject from "gnim/gobject"
import { PostInitHookParameters } from "../libmindustrice/component"
import Gtk from "gi://Gtk?version=4.0"
import OPBackground from "../libmindustrice/opening/OPBackground"
import CentralBanner from "../libmindustrice/opening/CentralBanner"

/**
 * Parameters of a (lockscreen) decoration component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Overlay> {
}

/**
 * Decoration is a visible layer to be displayed on all monitors when the session is locked.
 */
export default function Decoration({ ...passthrus }: Parameters) : GObject.Object {
  const $layer = ({ children }: { children: GObject.Object }) => (
    <box $type="overlay">{children}</box>
  );

  return (
    <Gtk.Overlay {...passthrus} >
      <$layer><OPBackground /></$layer>

      <$layer><DiagonalSquare asShadow /></$layer>
      <$layer><DiagonalSquare /></$layer>

      <$layer><DiagonalSquare asShadow /></$layer>
      <$layer><DiagonalSquare /></$layer>
      <$layer><CentralBanner /></$layer>
    </Gtk.Overlay>
  )
}

/**
 * DiagonalSquare mimics the two squares rotated 45 degrees in the opening (start screen) of the
 *                original game.
 */
function DiagonalSquare({ asShadow }: { asShadow?: boolean }) {
  const asShadowClass = asShadow ? "as-shadow" : ""

  return (
    <Gtk.AspectFrame hexpand >
      <Gtk.Box class={`diagonalSquare ${asShadowClass}`} />
    </Gtk.AspectFrame>
  )
}
