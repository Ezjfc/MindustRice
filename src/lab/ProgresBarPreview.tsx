/**
 * progress_bar implements the space preview for {@link ../components/progress_bar.tsx}.
 */

import GObject from "gi://GObject?version=2.0"
import { createState } from "gnim"
import ProgressBar, { Appearence } from "../libmindustrice/hud/ProgressBar"
import Preview from "./Preview"

export interface Parameters {
  defaultAppearence?: Appearence
}


export default function ProgressBarPreview({ defaultAppearence }: Parameters) : GObject.Object {
  const defaultProgress = 1.0

  const [appearence, setAppearence] = createState(defaultAppearence || {})
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
