/**
 * progress_bar implements the "chamfer-styled" bar in Mindustry.
 *
 * Visual documentation:
 */

import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createComputed, createState } from "gnim";
import { appearence_to_css } from "./component";

/**
 * Parameters holds parameters for a progress bar component.
 */
export interface Parameters {
  /**
   * progress controls how much the bar is filled. The value should be within 0..=1.
   * @default 1.0
   */
  progress?: number|Accessor<number>

  /**
   * appearence controls the generation of dynamic CSS.
   */
  appearence?: Appearence|Accessor<Appearence>
}

/**
 * Appearence holds CSS appearence parameters for progress bar component.
 */
export interface Appearence {
  /**
   * background is the CSS expression of an non-gradient colour.
   * @default  #1D2025
   */
  background: string
  /**
   * fill is the CSS expression of an non-gradient colour.
   * @default #EC7B4C
   */
  fill: string
  /**
   * fillShade is the CSS expression of an non-gradient colour.
   * @default #B35F3E
   */
  fillShade: string
}

/**
 * ProgressBar initialises a progress bar component.
 */
export function ProgressBar({ appearence, progress }: Parameters) : GObject.Object {
  const width = 175
  progress = progress || 1.0
  if (progress instanceof Accessor) {
    progress = progress.as(p => p * width)
  }

  return (
        // <overlay $={tooltip("Battery")} widthRequest={width}>
    // <box class="Battery" spacing={4}>
      <box class="progressBar" css={appearence_to_css(appearence)}>
        <overlay hexpand={true}>
          <revealer // TODO: try CSS transition for less lag
            transitionType={Gtk.RevealerTransitionType.CROSSFADE}
            // revealChild={charging}
            revealChild={false}
            transitionDuration={1000}
          >
            <box class="stripes marquee" />
          </revealer>
          <box $type="overlay">
            <Fill barWidth={createState(width)[0]} progress={progress} />
          </box>
          <label $type="overlay" label={"fjsdklfsdjkl"} useMarkup={true} />
        </overlay>
      </box>
    // </box>
          // <label $type="overlay" label={percent} useMarkup={true} />
  )
}

/**
 * Fill initialises the fill in a progress bar component.
 */
function Fill({ barWidth, progress }: {
  barWidth: Accessor<number>
  progress: number|Accessor<number>
}) : GObject.Object {
  let widthRequest
  if (progress instanceof Accessor) {
    widthRequest = createComputed(() => barWidth() * progress())
  } else {
    widthRequest = barWidth.as(w => w * progress)
  }

  return <box class="fill" widthRequest={widthRequest} />
}
