/*
 * progress_bar_smooth_fill mimics the filling animation of progress bar in the original game.
 *
 * TODO: or require adw for the entire file?? :
 * libadwaita is required for certain functions in this file, please refer to their doc comment.
 * libadwaita should be shipped with all MindustRice widgets. If your standalone application uses
 * those functions, please ensure libadwaita is shipped to or installed on end clients.
 */

import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createEffect, createState, Setter } from "gnim";
import GObject from "gnim/gobject";
import { Parameters as CoreParameters, default as UnanimatedProgressBar } from "./progress_bar";

/**
 * Parameters holds parameters for a progress bar component but modified to have parameters of an
 *            animated fill.
 */
export type Parameters = CoreParameters;

/**
 * ProgressBar initialises an instance of the progress bar component but modified to have an
 *             animated fill.
 */
export default function ProgressBar(params: Parameters) : GObject.Object {
  const { progress } = params
  if (!(progress instanceof Accessor)) return UnanimatedProgressBar(params)

  const { displayProgress, init } = handleStates(progress)
  params.progress = displayProgress

  return <box $={init} >{UnanimatedProgressBar(params)}</box>
}

/**
 * createAnimation initialises an animation for the fill of a progress bar.
 *
 * WARNING: invalid arguments could cause a segmentation fault.
 */
export function createAnimation(
  owner: Gtk.Widget,
  setFill: Setter<number>,
  fromProgress: number,
  toProgress: number,
) : Adw.TimedAnimation {
  return new Adw.TimedAnimation({
    widget: owner,
    value_from: fromProgress,
    value_to: toProgress,
    duration: 1000,
    easing: Adw.Easing.EASE_OUT_CUBIC,
    target: Adw.CallbackAnimationTarget.new((f: number) => setFill(f)),
  })
}

/**
 * AnimationQueue contains at most two toProgress values determining how the fill will be aniamted.
 *                The first one will immediately cause an animation to be played via
 *                {@link createAnimation} but it will only be popped AFTER the animation ends.
 *
 * The second one waits for the first one to finish. Adding animations to the queue when it is
 * full will always override the second one.
 */
type AnimationQueue = [number|null, number|null]

/**
 * handleStates holds return results for the function of the same name.
 */
interface handleStates {
  /**
   * displayProgress is the mapped accessor that respescts the animation.
   */
  displayProgress: Accessor<number>
  /**
   * init is the initialisation callback for the wrapper element.
   */
  init: (self: Gtk.Widget) => void
}

/**
 * handleStates maps the given progress accessor to one that respects the animation and creates an
 *              initialisation callback for the wrapper element of an
 *              {@link UnanimatedProgressBar}.
 */
function handleStates(progress: Accessor<number>) : handleStates {
  const [displayProgress, setDisplayProgress] = createState(progress.peek())
  const [queue, setQueue] = createState([null, null] as AnimationQueue)

  const enqueueProgress = (toProgress: number) => {
    console.log("en ", toProgress)
    const queued = queue.peek()
    if (!queued[0]) {
      queued[0] = toProgress
    } else {
      queued[1] = toProgress
    }

    setQueue(queued)
  }
  const shiftQueue = () => {
    const queued = queue.peek()
    console.log("shift before ", queued)
    queued[0] = queued[1]
    queued[1] = null
    console.log("shift after", queued)
    setQueue(queued)
  }
  const dequeueProgress = (owner: Gtk.Widget, queued: AnimationQueue) => {
    console.log("de ", queued)
    if (queued[1]) return false // There is an ongoing animation.

    const toProgress = queued[0]
    if (!toProgress) return false // All animations have ended.
    const fromProgress = displayProgress.peek()
  console.log("from ", fromProgress, "to ", toProgress)
    if (fromProgress === toProgress) {
      shiftQueue()
      return true
    }

    const anim = createAnimation(owner, setDisplayProgress, fromProgress, toProgress)
    anim.connect("done", shiftQueue)
    anim.play()

    return true
  }
  // TODO: test with gtk animation off option maybe via ags inspect

  const init = (self: Gtk.Widget) => {
    createEffect(() => {
      enqueueProgress(progress())
    })
    createEffect(() => {
      const queued = queue()
      const queueUpdated = dequeueProgress(self, queued)

      if (queueUpdated) setQueue(queued)
    })
  }

  return { displayProgress, init }
}
