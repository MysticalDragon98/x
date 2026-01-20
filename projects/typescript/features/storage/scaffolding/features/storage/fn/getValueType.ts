export function getValueType(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  const type = typeof value;

  if (type === "object") {
    const ctor = value.constructor;
    if (!ctor) return "object";

    const name = ctor.name;
    if (!name || name === "Object") return "object";

    return name;
  }

  return type;
}
