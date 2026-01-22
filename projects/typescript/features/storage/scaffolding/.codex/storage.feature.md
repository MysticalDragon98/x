# Storage Feature

Storage is the feature that manages all data flow in applications

1) Storage data types must follow the DDD pattern and each one must be a validated object itself with its business logic embedded
2) Value Objects (Values) and Entities belongs to modules and must be stored in ./src/{module} as /values/{name}.value.ts and /entities/{name}.entity.ts respectively
3) Entities and Values are defined with the @Token decorator from features/storage/decorators/token.decorator
4) The @Token decorator receives a **primitive type** that is the one that is extending the data type and will be serialized into when storing. If its a complex object, you want to use Object
5) the @Token decorator can receive the following options
- description?: One liner description for business logic context. Only meaning, not logic.
- id? (Mandatory in Entities): Defines which is the primary key on the object
- indexes? (Optional and only valid in Entities): Defines valuable indexes for searches, normally starts empty and it grows overtime

6) Given the class
@Token<X>()
class T {}

The @Token contract needs the @Token decorated class to implement the following methods.

- static serialize (_: T): X
- static deserialize (_: X): T

And the following fields are valuable for inspection in NON Object @Tokens
- static toString ()