/**
 * @see TrapezoidPreview
 */

import GObject from "gi://GObject?version=2.0"
import { createState } from "gnim"
import Preview, { BaseParameters as PreviewParameters } from "./Preview"
import Trapezoid from "../libmindustrice/opening/Trapezoid"
import Gtk from "gi://Gtk?version=4.0"

export interface Parameters extends PreviewParameters {
  // defaultAppearence?: Appearence
}

/**
 * TrapezoidPreview implements the preview space for {@link ../components/opening/Trapezoid.tsx}.
 */
export default function TrapezoidPreview({
  // defaultAppearence,
  defaultName,
}: Parameters) : GObject.Object {
  const defaultProgress = 1.0

  // const [appearence, setAppearence] = createState(defaultAppearence ?? {})
  const [progress, setProgress] = createState(defaultProgress)

  return (
    <Preview
      defaultName="Trapezoid"
    >
      <Trapezoid>
        <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
          <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
          <Gtk.Box css={"background-color: #FF341C; margin: 3px;"} hexpand vexpand />
        </Gtk.Box>
      </Trapezoid>
    </Preview>
  )
}
      // <Trapezoid>
      //   <Gtk.Box orientation={Gtk.Orientation.VERTICAL} >
      //     <Gtk.Box css={"background-color: yellow;"} heightRequest={50} />
      //     <Gtk.Box css={"background-color: red;"} heightRequest={50} />
      //   </Gtk.Box>
      // </Trapezoid>

/**
 * PreviewSettings of a trapezoid preview.
 *
 */
export interface PreviewSettings {
  corner: number
}
