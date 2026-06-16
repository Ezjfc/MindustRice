/**
 * @see Ribbon
 */

import GObject from "gnim/gobject"
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon"
import PixelImageDA from "../libmindustrice/PixelImageDA"
import { BUTTON_PIXEL_SCALE } from "./app"

/**
 * Ribbon is the title ribbon of the program.
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

/**
 * BulkSelectButton initialises that when being clicked, will toggle bulk select mode.
 *
 * In bulk select mode, a select button will be added to each preview.
 */
function BulkSelectButton() : GObject.Object {
  return (
    <button>
    </button>
  )
}
