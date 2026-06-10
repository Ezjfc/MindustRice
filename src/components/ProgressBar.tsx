/**
 * progress_bar mimics the "chamfer-styled" bar in the original game.
 *
 * Visual documentation: TODO
 */

import GObject from "gi://GObject?version=2.0"
import Gtk from "gi://Gtk?version=4.0"
import { Accessor, createBinding, createEffect } from "gnim"
import { appearenceToCss } from "./component"

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
 * Appearence holds CSS appearence parameters for a progress bar component.
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
 * ProgressBar initialises an instance of the component.
 */
export default function ProgressBar({ appearence, progress }: Parameters) : GObject.Object {
  progress = progress || 1.0
  const fillInit = handleProgress(progress)

  return (
    <box
      hexpand={true}
      class="progressBar"
      css={appearenceToCss(appearence)}
    >
      <box $={fillInit} class="fill" />
    </box>
  )
}

/**
 * handleProgress creates an initialisation callback for the fill box.
 *
 * A layout manager with constraints from {@link createDefaultConstraints} will the box is assigned
 * a new parent.
 *
 * Another constraint depends on the progress and is from {@link progressToConstraint}.
 */
function handleProgress(progress: number|Accessor<number>) {
  const getOrInitParentLayout = (self: Gtk.Widget, parent: Gtk.Widget) => {
    let layout: Gtk.ConstraintLayout
    const parent_layout = parent.layout_manager
    if (!(parent_layout instanceof Gtk.ConstraintLayout)) {
      layout = new Gtk.ConstraintLayout()
      for (const constraint of createPermanentConstraints(self)) {
        layout.add_constraint(constraint)
      }

      parent.set_layout_manager(layout)
      return layout
    } else {
      return parent_layout
    }
  }
  const fillInit = (self: Gtk.Widget) => {
    let lastConstraint: Gtk.Constraint|null = null;
    const getParent = createBinding(self, "parent")
    createEffect(() => {
      const parent = getParent()
      if (!parent) return

      const layout = getOrInitParentLayout(self, parent)
      if (lastConstraint) {
        layout.remove_constraint(lastConstraint)
      }

      const newConstraint = progressToConstraint(self, progress)
      layout.add_constraint(newConstraint)
      lastConstraint = newConstraint
    })
  }

  return fillInit
}

/**
 * progressToConstraint returns a constraint of the width attribute based on the progress.
 */
function progressToConstraint(widget: Gtk.Widget, progress: number|Accessor<number>) : Gtk.Constraint {
  if (progress instanceof Accessor) {
    progress = progress()
  }

  return new Gtk.Constraint({
    target: widget,
    targetAttribute: Gtk.ConstraintAttribute.WIDTH,
    relation: Gtk.ConstraintRelation.EQ,
    source: null,
    sourceAttribute: Gtk.ConstraintAttribute.WIDTH,
    multiplier: progress,
    constant: 0,
    strength: Gtk.ConstraintStrength.REQUIRED,
  })
}

/**
 * createPermanentConstraints returns constraints of non-changing attributes that are required to
 * render the component.
 */
function createPermanentConstraints(widget: Gtk.Widget) : Gtk.Constraint[] {
  return [
    Gtk.ConstraintAttribute.START,
    Gtk.ConstraintAttribute.TOP,
    Gtk.ConstraintAttribute.BOTTOM,
  ].map((attr) => new Gtk.Constraint({
    target: widget,
    targetAttribute: attr,
    relation: Gtk.ConstraintRelation.EQ,
    source: null,
    sourceAttribute: attr,
    multiplier: 1.0,
    constant: 0,
    strength: Gtk.ConstraintStrength.REQUIRED,
  }))
}

