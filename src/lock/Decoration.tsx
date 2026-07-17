/**
 * @see Decoration
 */

import GObject from "gnim/gobject"
import { PostInitHookParameters } from "../libmindustrice/component"
import Gtk from "gi://Gtk?version=4.0"
import OPBackground from "../libmindustrice/opening/OPBackground"
import CentralBanner from "../libmindustrice/opening/CentralBanner"
import Trapezoid from "../libmindustrice/opening/Trapezoid"

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
      <$layer><DiagonalSquares /></$layer>
      <$layer><InfoLayer /></$layer>
      <$layer><CentralBanner /></$layer>
    </Gtk.Overlay>
  )
}

/**
 * InfoLayer mimics the trapezoid widgets in the opening (start screen) of the original game. The
 *           widgets will be interactive.
 */
function InfoLayer() : GObject.Object {
  return (
    <Gtk.Grid $={(self) => {
      self.attach((
        <Trapezoid>
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
          </Gtk.Box>
        </Trapezoid>
      ) as Gtk.Widget, 0, 0, 1, 1)

      self.attach((
        <Trapezoid hmirror >
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
          </Gtk.Box>
        </Trapezoid>
      ) as Gtk.Widget, 1, 0, 1, 1)

      self.attach((
        <Trapezoid vmirror >
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
          </Gtk.Box>
        </Trapezoid>
      ) as Gtk.Widget, 0, 1, 1, 1)

      self.attach((
        <Trapezoid hmirror vmirror >
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
            <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
          </Gtk.Box>
        </Trapezoid>
      ) as Gtk.Widget, 1, 1, 1, 1)
    }} columnSpacing={2} rowSpacing={2} />
  )
}

/**
 * DiagonalSquare mimics the two squares rotated 45 degrees in the opening (start screen) of the
 *                original game.
 */
function DiagonalSquares() : GObject.Object {
  return (
    <Gtk.AspectFrame>
      <Gtk.Box vexpand hexpand class="diagonalSquares">
        <Gtk.Box vexpand hexpand />
      </Gtk.Box>
    </Gtk.AspectFrame>
  )
}
