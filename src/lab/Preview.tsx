/**
 * @see Preview
 */
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createBinding, createComputed, createEffect, createState, Setter, With } from "gnim";
import GObject from "gnim/gobject";
import { BUTTON_PIXEL_SCALE } from "./app";
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon";
import PixelImage from "../libmindustrice/PixelImage";
import FitEntry from "../libmindustrice/menu/FitEntry";
import { $ } from "gnim-hooks";
import GlyphIcon from "../libmindustrice/GlyphIcon";
import Resizer from "./Resizer";
import OptionsPane from "./OptionsPane";

/**
 * Parameters of a preview component. The default name option is made required instead of optional.
 */
export interface Parameters
extends Omit<BaseParameters, "defaultName">,
        Required<Pick<BaseParameters, "defaultName">> {
  /**
   * children decides what component is being previewed.
   */
  children: GObject.Object
}

/**
 * BaseParameters of a preview component.
 */
export interface BaseParameters {
  /**
   * defaultName holds the name for newly added component until the user changes it.
   */
  defaultName?: string
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
  children,
  defaultName,
  defaultWidth,
  defaultHeight,
}: Parameters) : GObject.Object {
  defaultWidth ??= 500
  defaultHeight ??= 40
  const [name, setName] = createState(defaultName)
  const [collapsed, setCollapsed] = createState(false)
  const [optionsVisible, setOptionsVisible] = createState(true)
  const [width, setWidth] = createState(defaultWidth)
  const [height, setHeight] = createState(defaultHeight)

  const dimensionParams = {
    width: width,
    height: height,
    setWidth: setWidth,
    setHeight: setHeight,
  }
  const $layer = ({ children }: { children: GObject.Object }) => (
    <Gtk.Box $={(self) => {
      const getParent = createBinding(self, "parent") as Accessor<Gtk.Overlay>
      createEffect(() => getParent().set_measure_overlay(self, true))
    }} $type="overlay" hexpand halign={Gtk.Align.END} >
    {children}
    </Gtk.Box>
  )

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="Preview" >
      <Toolbar
        name={name}
        setName={setName}
        generateName={name}
        setCollapsed={setCollapsed}
      />
      <Gtk.Overlay visible={collapsed.as(c => !c)} >
        <Resizer {...dimensionParams} >
        {children}
        </Resizer>

        <$layer><OptionsPane optionsVisible={optionsVisible} {...dimensionParams} /></$layer>
        <$layer><OptionsButton active={optionsVisible} setActive={setOptionsVisible} /></$layer>
      </Gtk.Overlay>
    </box>
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
 * DuplicatePreviewButton initialises a button that when being clicked, will show a popup asking
 *                        if the exact preview should be duplicated or just its base component.
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
 * OptionsButton initialises a button that toggles the visibility of the options pane in a preview.
 */
function OptionsButton({ active, setActive }: {
  active: Accessor<boolean>,
  setActive: Setter<boolean>,
}) : GObject.Object {
  return (
    <Gtk.Box class="optionsToggle" orientation={Gtk.Orientation.VERTICAL} >
      <Gtk.ToggleButton active={active} onToggled={({ active }) => setActive(active)} >
        <PixelImage file={getExtMindustryIcon("tools")} scale={BUTTON_PIXEL_SCALE} />
      </Gtk.ToggleButton>
    </Gtk.Box>
  )
}
