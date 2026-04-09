# Storage (DDD)

1. Storage types follow DDD.
2. Entities have identity, are mutable only through methods, and are persisted at `entities/{Name}.entity.ts`.
3. Values have no identity, are immutable, and are stored at `values/{Name}.value.ts`.
4. Entity properties must be `public`; mutations must go through methods.
5. Values should prefer normalization over throwing when normalization does not change semantics.

## Entity Template

```ts
import { Token } from "@features/storage/decorators/token.decorator";
import { Index } from "@features/storage/classes/Index";
import { Field } from "@features/storage/decorators/field.decorator";

@Token<Object>({
  description: "One liner description",
  id: "idPropertyName",
  indexes: [new Index({ name: "indexName", fields: { fieldName: "asc" } })]
})
export class EntityName {

  @Field(FieldType, { optional: true, index: true, unique: true })
  fieldName: FieldType;

  @Field([FieldType])
  arrayField: FieldType[];

  constructor(properties: { fieldName: FieldType; arrayField: FieldType[] }) {
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }

}
```

Notes:
- Use the `indexes` array only for compound or complex indexes.
- For simple indexes, prefer `@Field(T, { index: true })`.
- For arrays, wrap the decorator type as `[FieldType]` and keep the TypeScript field typed as `FieldType[]`.
- Constructors receive a single object containing every field.

## Value Templates

Object-based values use the same pattern as entities but omit `id` and `indexes` from `@Token(...)`.

Primitive-based values extend the boxed primitive type:

```ts
@Token<PrimitiveType>({
  description: "One liner description"
})
export class ValueName extends PrimitiveType {

  constructor(value: PrimitiveType) {
    super(value);
  }

}
```

## Index Files

1. Domain object indexes live at `src/modules/{module}/entities/INDEX.md` or `src/modules/{module}/values/INDEX.md`.
2. Update `INDEX.md` whenever an entity or value is created or modified.
3. Format each line as `{NAME}: {DESCRIPTION}`.
