/**
 * @see ProgressBarPreview
 */

import GObject from "gi://GObject?version=2.0"
import { createState } from "gnim"
import ProgressBar, { Appearence } from "../libmindustrice/hud/ProgressBar"
import Preview from "./Preview"

export interface Parameters {
  defaultAppearence?: Appearence
  defaultName?: string
}

/**
 * ProgressBarPreview implements the space preview for {@link ../components/progress_bar.tsx}.
 */
export default function ProgressBarPreview({
  defaultAppearence,
  defaultName,
}: Parameters) : GObject.Object {
  const defaultProgress = 1.0

  const [appearence, setAppearence] = createState(defaultAppearence ?? {})
  const [progress, setProgress] = createState(defaultProgress)

  return (
    <Preview defaultName={defaultName || "Progress Bar"}
    >
      <ProgressBar appearence={appearence} progress={progress} hexpand />
    </Preview>
  )
}

/**
 * PreviewSettings of the progress bar preview.
 */
export interface PreviewSettings {
  invert_chamfers: boolean
  invert_fill_and_shade: boolean
}
