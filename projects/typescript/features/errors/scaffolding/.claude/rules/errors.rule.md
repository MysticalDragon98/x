# Errors

1. All code that emits domain errors must use `@features/errors`.
2. Define local errors with:

```ts
import { CustomErrors, $assert } from "@features/errors";

const Errors = CustomErrors({
    ErrorCode: (...args) => `Constructed error message`
});
```

3. Use `$assert(condition, Errors.ErrorCode(args))` for conditional failures.
4. Use `$throw(Errors.ErrorCode(args))` for unconditional failures. Never write `$assert(false, ...)`.
5. Any code calling a lower layer, especially integration classes, must wrap lower-layer calls with `$mapError` so lower-layer `CustomError`s do not leak across boundaries.

```ts
import { $mapError } from "@features/errors";

const result = await $mapError(lowerLayer.call(), {
    SpecificCode: (error) => Errors.MappedError(error.message),
    _: (error) => Errors.DefaultError(error.message),
});
```

6. `$mapError` behavior:
   - The mapper is keyed by error code.
   - `_` is the default handler for unmatched `CustomError` codes.
   - If no match and no `_` handler exist, the original `CustomError` propagates.
   - Non-`CustomError` exceptions always propagate unchanged.
