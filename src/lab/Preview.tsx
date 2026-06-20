/**
 * @see Preview
 */
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createBinding, createComputed, createEffect, createState, Setter } from "gnim";
import GObject from "gnim/gobject";
import { BUTTON_PIXEL_SCALE } from "./app";
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon";
import PixelImage from "../libmindustrice/PixelImage";
import FitEntry from "../libmindustrice/menu/FitEntry";
import { $ } from "gnim-hooks";

/**
 * Parameters of a preview component.
 */
export interface Parameters {
  /**
   * component decides what component is being previewed.
   */
  component: GObject.Object
  /**
   * defaultName holds the name for newly added component until the user changes it.
   */
  defaultName: string
}

/**
 * Preview is a wrapper to display a component for preview alongside allowing users to tweaks the
 *         settings for that component.
 */
export default function Preview({ component, defaultName }: Parameters) : GObject.Object {
  const [name, setName] = createState(defaultName)

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="Preview">
      <Toolbar
        name={name}
        setName={setName}
        generateName={name}
      />
      <Resizer component={component} />
    </box>
  )
}

/**
 * Resizer initialises vertical and horizontal resizing panes that wraps the component.
 */
function Resizer({ component }: { component: GObject.Object }) : GObject.Object {
  const defaultHeight = 40
  const defaultWidth = 500

  return (
    <Gtk.Paned orientation={Gtk.Orientation.VERTICAL} position={defaultHeight} >
      <Gtk.Paned orientation={Gtk.Orientation.HORIZONTAL} position={defaultWidth} >
          {component}
          <box hexpand={true} />
      </Gtk.Paned>
      <box vexpand={true} />
    </Gtk.Paned>
  )
}

/**
 * Toolbar initialises the toolbar in a preview component.
 */
function Toolbar({ name, setName, generateName }: {
  name: Accessor<string>,
  setName: Setter<string>,
  generateName: Accessor<string>,
}) : GObject.Object {
  let getText: $<string>|undefined
  const placeholderVisible = createComputed(() => {
    if (getText) return $(getText)() === ""
    return false
  })

  return (
    <box class="Toolbar" valign={Gtk.Align.START} >
      <FitEntry
        $={(self) => getText = createBinding(self, "text")}
        appearence={{ noUnderline: true }}
        fitToText={false}
        placeholderText={generateName}
        text={name}
      />
      <box visible={placeholderVisible} hexpand={true} >
        <label label="(press Enter to use default name, Esc to cancel edit)" />
      </box>
      <box halign={Gtk.Align.END}>
        <DuplicatePreviewButton />
        <RemovePreviewButton />
      </box>
    </box>
  )
}

/**
 * RemovePreviewButton initialises a button that when being clicked, will show a confirmation popup
 *                     asking whether or not to remove the preview.
 */
function RemovePreviewButton() : GObject.Object {
  return (
    <button>
      <PixelImage file={getExtMindustryIcon("trash")} scale={BUTTON_PIXEL_SCALE} />
    </button>
  )
}

/**
 * DuplicatePreviewButton initialises a button that when being clicked, will duplicate the current
 *                        preview to a space directly below, including its component and settings.
 */
function DuplicatePreviewButton() : GObject.Object {
  return (
    <button>
      <PixelImage file={getExtMindustryIcon("copy")} scale={BUTTON_PIXEL_SCALE} />
    </button>
  )
}

/**
 * AddBaseComponentButton initialises a button that when being clicked, will add a new preview
 *                        with the same component as the current preview to a space directly below.
 *                        The new preview will have all default settings.
 */
// function DuplicatePreviewButton() : GObject.Object {
// }
