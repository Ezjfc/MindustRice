/**
 * progress_bar implements the space preview for {@link ../components/progress_bar.tsx}.
 */

import GObject from "gi://GObject?version=2.0"
import { createBinding, createEffect, createState } from "gnim"
import ProgressBar from "../components/progress_bar"
import Gtk from "gi://Gtk?version=4.0"
import { createAnimation } from "../components/progress_bar_smooth_fill"

export function ProgressBarPreview() : GObject.Object {
  const defaultProgress = 1.0

  const [appearence, setAppearence] = createState({})
  const [progress, setProgress] = createState(defaultProgress)

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="progressBarPreview">
      <box heightRequest={40}>
        <ProgressBar appearence={appearence} progress={progress} />
      </box>
      <box vexpand={true}>
        <Gtk.ColorChooserWidget $={(self) => {
          const rgba = createBinding(self, "rgba")
          createEffect(() => {
            setAppearence({ fill: rgba().to_string() })
          })
        }} />
        <slider value={defaultProgress} min={0} max={1} onChangeValue={(self) => {
          createAnimation(self, setProgress, 0, self.value).play()
        }} hexpand={true} />
      </box>
    </box>
  )
}

export interface PreviewSettings {
  invert_chamfers: boolean
  invert_fill_and_shade: boolean
}
