/**
 * progress_bar implements the "chamfer-styled" bar in Mindustry.
 *
 * Visual documentation: TODO
 */

import GObject from "gi://GObject?version=2.0"
import Gtk from "gi://Gtk?version=4.0"
import { Accessor, createBinding, createComputed, createEffect, createState } from "gnim"
import { appearenceToCss, bindWidth } from "./component"

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
  background?: string
  /**
   * fill is the CSS expression of an non-gradient colour.
   * @default #EC7B4C
   */
  fill?: string
  /**
   * fillShade is the CSS expression of an non-gradient colour.
   * @default #B35F3E
   */
  fillShade?: string
}

/**
 * ProgressBar initialises a progress bar component.
 */
export function ProgressBar({ appearence, progress }: Parameters) : GObject.Object {
  // const width = 175
  progress = progress || 1.0

  const initConstraint = (self: Gtk.Widget) => self.set_layout_manager(new Gtk.ConstraintLayout())
  const applyConstraint = (self: Gtk.Widget) => {
    if (!(progress instanceof Accessor)) {
      return
    }
    // const getParent = createBinding(self, "parent")
    createEffect(() => {
      let prevConstraint
      const parent = self.parent
      if (parent?.layout_manager instanceof Gtk.ConstraintLayout) {
        parent.layout_manager.remove_all_constraints()
        console.log(progress())
        prevConstraint = progressToConstraint(self, progress())
        parent.layout_manager.add_constraint(prevConstraint)

        for (const attr of [
          Gtk.ConstraintAttribute.START,
        Gtk.ConstraintAttribute.TOP,
        Gtk.ConstraintAttribute.BOTTOM,
        ]) {
          parent.layout_manager.add_constraint(new Gtk.Constraint({
            target: self,
            targetAttribute: attr,
            relation: Gtk.ConstraintRelation.EQ,
            source: null,
            sourceAttribute: attr,
            multiplier: 1,
            constant: 0,
            strength: Gtk.ConstraintStrength.REQUIRED,
          }))
        }
      }
    })
  }

  return (
    <box
      $={initConstraint}
      hexpand={true}
      class="progressBar"
      css={appearenceToCss(appearence)}
    >
      <box $={applyConstraint} class="fill" hexpand={true} />
    </box>
  )
}

function progressToConstraint(widget: Gtk.Widget, progress: number) : Gtk.Constraint {
  return new Gtk.Constraint({
    target: widget,
    targetAttribute: Gtk.ConstraintAttribute.WIDTH,
    relation: Gtk.ConstraintRelation.EQ,
    source: null,
    sourceAttribute: Gtk.ConstraintAttribute.WIDTH,
    multiplier: progress,
    constant: 0,
    strength: Gtk.ConstraintStrength.REQUIRED
  })
}
