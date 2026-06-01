/**
 * progress_bar implements the "chamfer-styled" bar in Mindustry.
 *
 * Visual documentation:
 */

import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor } from "gnim";

/**
 * ProgressBar holds parameters for a progress bar component.
 */
export interface ProgressBar {
  /**
   * progress controls how much the progress bar is filled. The value should be within 0..=1.
   */
  progress?: number|Accessor<number>
}

/**
 * progressBar initialises a progress bar component.
 */
export function progressBar({ progress }: ProgressBar) : GObject.Object {
  const width = 175
  if (progress instanceof Accessor) {
    progress = progress.as(p => p * width)
  }

  return (
        // <overlay $={tooltip("Battery")} widthRequest={width}>
    // <box class="Battery" spacing={4}>
      <box class="progressBar">
        <overlay widthRequest={width}>
          <revealer // TODO: try CSS transition for less lag
            transitionType={Gtk.RevealerTransitionType.CROSSFADE}
            // revealChild={charging}
            revealChild={false}
            transitionDuration={1000}
          >
            <box class="stripes marquee" />
          </revealer>
          <box $type="overlay">
            <box class="fill" widthRequest={progress} />
          </box>
          <label $type="overlay" label={"fjsdklfsdjkl"} useMarkup={true} />
        </overlay>
      </box>
    // </box>
          // <label $type="overlay" label={percent} useMarkup={true} />
  )
}
