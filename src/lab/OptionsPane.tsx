/**
 * @see OptionsPane
 */

import { Accessor, createState, Setter } from "gnim"
import { PostInitHookParameters } from "../libmindustrice/component"
import GObject from "gnim/gobject"
import Gtk from "gi://Gtk?version=4.0"
import PixelImage from "../libmindustrice/PixelImage"
import getExtMindustryIcon from "../libmindustrice/extMindustryIcon"
import { BUTTON_PIXEL_SCALE_SMALL } from "./app"
import Entry from "../libmindustrice/menu/Entry"

/**
 * Parameters of an options pane component.
 */
export interface Parameters extends PostInitHookParameters<Gtk.Box> {
 optionsVisible: Accessor<boolean>
 width: Accessor<number>
 height: Accessor<number>
 setWidth: Setter<number>
 setHeight: Setter<number>
}

/**
 * OptionsPane of a preview which exists as a layer (overlay) on top of the previewing component.
 *             The pane can be hidden through optionsVisible.
 */
export default function OptionsPane({
  optionsVisible,
  width,
  height,
  setWidth,
  setHeight,
}: Parameters) : GObject.Object {
  const $option = ({ name, value, setValue }: {
    name: string,
    value: Accessor<string>,
    setValue: Setter<string>,
  }) => {
    const defaultValue = value.peek()
    const [valueChanged, setValueChanged] = createState(false)

    const button = <RestoreOptionButton valueChanged={valueChanged} /> as Gtk.Button
    const entryInit = (self: Gtk.Entry) => {
      self.connect("changed", ({ text }) => {
        if (text !== value.peek()) setValue(text)
        setValueChanged(text !== defaultValue)
      })
      button.connect("clicked", () => self.set_text(defaultValue))
    }

    return (
      <Gtk.Box class="option-item" >
        <Gtk.Label label={name} />
        <Entry
          $={entryInit}
          text={value}
          appearence={{ underlinePadding: "0px" }}
        />
        {button}
      </Gtk.Box>
    )
  }

  const toString = (a: Accessor<number>) => a.as(n => `${n}`)
  const fromString = (s: Setter<number>): Setter<string> => (t) => {
    if (typeof t === "string") {
      const parsed = parseInt(t)
      if (isNaN(parsed) || !isFinite(parsed)) return
      s(parsed)
    }
  }

  return (
    <Gtk.Box class="optionsPane" visible={optionsVisible} orientation={Gtk.Orientation.VERTICAL} >
      <Gtk.Box>
        <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
          <$option name="Width" value={toString(width)} setValue={fromString(setWidth)} />
          <$option name="Height" value={toString(height)} setValue={fromString(setHeight)} />
        </Gtk.Box>
        <AspectRatioButton />
      </Gtk.Box>
    </Gtk.Box>
  )
}

/**
 * RestoreOptionButton initialises a button that restores an option to its initial value. The button will
 *               be hidden until that option has been altered.
 */
function RestoreOptionButton({ valueChanged }: { valueChanged: Accessor<boolean> }) : GObject.Object {
  return (
    <Gtk.Button
      sensitive={valueChanged}
      opacity={valueChanged.as(v => v ? 1.0 : 0.0)}
    >
      <Gtk.AspectFrame>
        <PixelImage file={getExtMindustryIcon("rotate")} scale={BUTTON_PIXEL_SCALE_SMALL} />
      </Gtk.AspectFrame>
    </Gtk.Button>
  )
}

/**
 * RestoreOptionButton initialises a button that restores an option to its initial value. The button will
 *               be hidden until that option has been altered.
 */
function AspectRatioButton() : GObject.Object {
  return (
    <Gtk.AspectFrame>
    </Gtk.AspectFrame>
  )
}
