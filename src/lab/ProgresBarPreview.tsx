/**
 * progress_bar implements the space preview for {@link ../components/progress_bar.tsx}.
 */

import GObject from "gi://GObject?version=2.0"
import { createBinding, createEffect, createState } from "gnim"
import ProgressBar from "../libmindustrice/hud/ProgressBar"
import Gtk from "gi://Gtk?version=4.0"
import Preview from "./Preview"


export default function ProgressBarPreview() : GObject.Object {
  const defaultProgress = 1.0

  const [appearence, setAppearence] = createState({})
  const [progress, setProgress] = createState(defaultProgress)

  return <Preview
    component={ProgressBar({ appearence, progress })}
    defaultName="Progress Bar"
  />
}

export interface PreviewSettings {
  invert_chamfers: boolean
  invert_fill_and_shade: boolean
}
