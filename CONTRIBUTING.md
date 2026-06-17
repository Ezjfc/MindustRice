# Complying with these rules

Mark a place with TODO and a note when it has not yet complied with the rules.

# Formatting and documentating

For code formats, please refer to .editorconfig and eslint.config.js

### Text documentation

1. Documentation should be placed on top of all symbols in .ts or .tsx files except for function
   overloads. *However, it can be as simple as a few words*.
2. Documentation should be placed at the beginning of .ts or .tsx files. *However, it can be as
   simple as a few words*. For a file that holds components, it should simply be a `@see` field
   referring to function that initialises the main/only component.
3. For the first paragraph of a documentation, it should start with the symbol name. If it has
   multiple lines, all following lines should be indented to the length of the symbol name.

**Good example**

```ts
export function appearenceToCss(appearence?: Appearence): string
export function appearenceToCss(appearence?: Accessor<Appearence>): Accessor<string>

/**
 * appearenceToCss converts appearence parameters of a component to CSS variable codes.
 */
export function appearenceToCss(appearence?: Appearence|Accessor<Appearence>) : string|Accessor<string> {
  ...
}

/**
 * createPermanentConstraints returns constraints of non-changing attributes that are required to
 *                            render the component.
 */
function createPermanentConstraints(widget: Gtk.Widget) : Gtk.Constraint[] {
  ...
}
```

**Bad examples**

```ts
export function appearenceToCss(appearence?: Appearence): string
export function appearenceToCss(appearence?: Accessor<Appearence>): Accessor<string>
export function appearenceToCss(appearence?: Appearence|Accessor<Appearence>) : string|Accessor<string> {
  ...
}

/**
 * createPermanentConstraints returns constraints of non-changing attributes that are required to
 * render the component.
 */
function createPermanentConstraints(widget: Gtk.Widget) : Gtk.Constraint[] {
  ...
}

```

### Visual documentation

In libmindustrice, a component should include a visual documentation if it correspond a in-game
component. The visual documentation have to compare the original look in-game and the appearence
of the implementation in MindustRice.

# Create or editing components

### Organising components

1. In libmindustrice, each component should live in its own file. Each file may have up to one
   function that initialise a component while the rest are considered helpler functions.
2. Outside of libmindustrice, a file may stack up multiple functions that initialise a component
   and their helper functions.

### Use of accessor and effects

1. Avoid `createEffect()` in a function that does not initialise a component. *Note this does
   not apply to callbacks.* For it to work with any effects, return a callback.
2. Avoid tracking the dependency of an Accessor in a function that does not initialise a component.
   *Note this does not apply to callbacks.* For it to work with any Accessor, call `.as()` on the
   Accessor and return the derivative, which is another Accessor. The ideal way to design that
   function would be overloading its return type and using recursion. When in doubt, remove all
   uses of Accessor from it and let its caller handle the logic.

**Good example**

```ts
/**
 * ...
 */
function handleProgress(progress: number|Accessor<number>) {
  const fillInit = (self: Gtk.Widget) => {
    ...
      if (progress instanceof Accessor) {
        progress = progress()
      }
      const newConstraint = progressToConstraint(self, progress)
    ...
  }
  ...
}

/**
 * ...
 */
function progressToConstraint(widget: Gtk.Widget, progress: number) : Gtk.Constraint {
  return ...
}
```

**Bad example**

```ts
/**
 * ...
 */
function handleProgress(progress: number|Accessor<number>) {
  const fillInit = (self: Gtk.Widget) => {
    ...
      const newConstraint = progressToConstraint(self, progress)
    ...
  }
  ...
}

/**
 * ...
 */
function progressToConstraint(widget: Gtk.Widget, progress: number|Accessor<number>) : Gtk.Constraint {
  if (progress instanceof Accessor) {
    progress = progress()
  }

  return ...
}
```
