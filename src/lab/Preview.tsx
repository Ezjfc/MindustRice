/**
 * @see Preview
 */
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createBinding, createComputed, createState, Setter, With } from "gnim";
import GObject from "gnim/gobject";
import { BUTTON_PIXEL_SCALE } from "./app";
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon";
import PixelImage from "../libmindustrice/PixelImage";
import FitEntry from "../libmindustrice/menu/FitEntry";
import { $ } from "gnim-hooks";
import GlyphIcon from "../libmindustrice/GlyphIcon";

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
  /**
   * defaultWidth decides initial width until the user resizes it.
   * @default 40
   */
  defaultWidth?: number
  /**
   * defaultHeight decides initial width until the user resizes it.
   * @default 500
   */
  defaultHeight?: number
}

/**
 * Preview is a wrapper to display a component for preview alongside allowing users to tweaks the
 *         settings for that component.
 */
export default function Preview({
  component,
  defaultName,
  defaultWidth,
  defaultHeight,
}: Parameters) : GObject.Object {
  const [name, setName] = createState(defaultName)
  const [collapsed, setCollapsed] = createState(false)

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="Preview">
      <Toolbar
        name={name}
        setName={setName}
        generateName={name}
        setCollapsed={setCollapsed}
      />
      <Resizer
        component={component}
        defaultWidth={defaultWidth}
        defaultHeight={defaultHeight}
        visible={collapsed.as(c => !c)}
      />
    </box>
  )
}

/**
 * Resizer initialises vertical and horizontal resizing panes that wraps the component.
 */
function Resizer({ component, defaultWidth, defaultHeight, visible }: {
  component: GObject.Object,
  defaultWidth?: number,
  defaultHeight?: number,
  visible: Accessor<boolean>
}) : GObject.Object {
  defaultWidth = defaultWidth ?? 500
  defaultHeight = defaultHeight ?? 40

  return (
    <Gtk.Paned orientation={Gtk.Orientation.VERTICAL} position={defaultHeight} visible={visible} >
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
function Toolbar({ name, setName, generateName, setCollapsed }: {
  name: Accessor<string>,
  setName: Setter<string>,
  generateName: Accessor<string>,
  setCollapsed: Setter<boolean>,
}) : GObject.Object {
  let getText: $<string>|undefined
  const placeholderVisible = createComputed(() => {
    if (getText) return $(getText)() === ""
    return false
  })

  return (
    <box class="Toolbar" valign={Gtk.Align.START} >
    <FoldButton setCollapsed={setCollapsed} />
      <FitEntry
        $={(self) => getText = createBinding(self, "text")}
        appearence={{ noUnderline: true }}
        fitToText={false}
        placeholderText={generateName}
        text={name}
      />
      <box visible={placeholderVisible} hexpand={true} >
        <label
          class="entry-placeholder-small"
          label="(press Enter to use default name, Esc to cancel edit)"
        />
      </box>
      <box halign={Gtk.Align.END}>
        <DuplicatePreviewButton />
        <RemovePreviewButton />
      </box>
    </box>
  )
}

/**
 * FoldButton initialises a button that expands or collapses the preview on click.
 */
function FoldButton({ setCollapsed }: {
  setCollapsed: Setter<boolean>,
}) : GObject.Object {
  const [active, setActive] = createState(false)

  return (
    <Gtk.ToggleButton onToggled={({ active }) => {
      setActive(active)
      setCollapsed(active)
    }}>
      <With value={active}>
      {a => a ? (<GlyphIcon iconDownOpen />) : (<GlyphIcon iconUpOpen />)}
      </With>
    </Gtk.ToggleButton>
  )
}

/**
 * RemovePreviewButton initialises a button that when being clicked, will show a confirmation popup
 *                     asking whether or not to remove the preview.
 */
function RemovePreviewButton() : GObject.Object {
  return (
    <Gtk.Button>
      <PixelImage file={getExtMindustryIcon("trash")} scale={BUTTON_PIXEL_SCALE} />
    </Gtk.Button>
  )
}

/**
 * DuplicatePreviewButton initialises a button that when being clicked, will duplicate the current
 *                        preview to a space directly below, including its component and settings.
 *
 * NOTE: 14% smaller than other buttons because it seems the Copy icon is slightly larger.
 */
function DuplicatePreviewButton() : GObject.Object {
  return (
    <Gtk.Button>
      <PixelImage file={getExtMindustryIcon("copy")} scale={BUTTON_PIXEL_SCALE * 0.86} />
    </Gtk.Button>
  )
}

/**
 * AddBaseComponentButton initialises a button that when being clicked, will add a new preview
 *                        with the same component as the current preview to a space directly below.
 *                        The new preview will have all default settings.
 */
// function DuplicatePreviewButton() : GObject.Object {
// }
