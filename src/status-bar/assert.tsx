export default function restrictUnpack(unexpectedArgs: Object) {
  // TODO: will be removed at later state in favour of TypeScript safety features.

  const realKeys = Object
    .keys(unexpectedArgs)
    .filter(key => key !== "children"); // Whatever GJS wants to do here...

  if (realKeys.length !== 0) {
    throw new Error(`unexpected args: ${realKeys.join(", ")}`)
  }
}
