/**
 * Ribbon is the title ribbon of the program.
 */

import GObject from "gnim/gobject"
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon"
import Gtk from "gi://Gtk?version=4.0"
import PixelImageDA from "../libmindustrice/PixelImageDA"
import { BUTTON_PIXEL_SCALE } from "./app"


/**
 * Ribbon initialises the component.
 */
export default function Ribbon() : GObject.Object {
  return (
    <box>
      <box hexpand={true} />
      <FreeCanvasButton />
      <AddcomponentButton />
    </box>
  )
}

/**
 * FreeCanvasButton initialises a button that starts the free canvas mode on click.
 */
function FreeCanvasButton() : GObject.Object {
  return (
    <button>
      <PixelImageDA file={getExtMindustryIcon("map")} scale={BUTTON_PIXEL_SCALE} />
    </button>
  )
}

/**
 * AddcomponentButton initialises a button that opens the components menu on click.
 */
function AddcomponentButton() : GObject.Object {
  return (
    <button>
      <PixelImageDA file={getExtMindustryIcon("add")} scale={BUTTON_PIXEL_SCALE} />
    </button>
  )
}
