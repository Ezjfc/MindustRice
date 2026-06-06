/**
 * progress_bar_smooth_fill mimics the filling animation of progress bar in the original game.
 *
 * TODO: or require adw for the entire file?? :
 * libadwaita is required for certain functions in this file, please refer to their doc comment.
 * libadwaita should be shipped with all MindustRice widgets. If your standalone application uses
 * those functions, please ensure libadwaita is shipped to or installed on end clients.
 */

import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import { Setter } from "gnim";

export function createAnimation(
  widget: Gtk.Widget,
  setFill: Setter<number>,
  fromProgress: number,
  toProgress: number,
) : Adw.TimedAnimation {
  const onTick = (f: number) => setFill(f)

  return new Adw.TimedAnimation({
    widget,
    value_from: fromProgress,
    value_to: toProgress,
    duration: 250,
    easing: Adw.Easing.EASE_OUT_EXPO,
    target: new Adw.AnimationTarget(onTick),
  })
}
