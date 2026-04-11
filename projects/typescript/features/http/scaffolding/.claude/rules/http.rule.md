# HTTP Feature

1. HTTP endpoints belong to modules at `src/modules/{module}/http/{endpoint}.http-endpoint.ts`.
2. Each endpoint has a corresponding meta file at `features/http/endpoints/{module}/{endpoint}.http-meta.ts`.
3. Endpoint routes resolve to `/{module}/{endpoint}`.
4. GET requests read from `req.query`; POST requests read from `req.body`.
5. All arguments are validated and type-checked by the meta file before reaching the endpoint function. Do not add manual validation inside endpoint functions.
6. When endpoint arguments change, update the meta file to match: the type alias, `Params` array, and `Validator`.

## Endpoint File

Located at `src/modules/{module}/http/{endpoint}.http-endpoint.ts`:

```ts
import { HTTPResponse } from "@features/http/types/HTTPResponse.type";

export default async function {endpointInCamelCase}HTTPEndpoint({args}) {
    // business logic
    return HTTPResponse.Ok("Message", data);
}
```

- The function name is `{endpointInCamelCase}HTTPEndpoint`.
- Arguments are positional, matching the order in the meta file's `Params` array.
- Return an `HTTPResponse` to control the status code.

## Meta File

Located at `features/http/endpoints/{module}/{endpoint}.http-meta.ts`:

```ts
import {endpointInCamelCase} from '@/src/modules/{module}/http/{endpoint}.http-endpoint';
import { HTTPEndpoint } from '../../classes/http-endpoint.class';
import * as z from 'zod/v4';

type {EndpointInPascalCase}HTTPEndpointInput = {
    {paramName}: {tsType};
};

const Params = [
    { "name": "{paramName}", "type": "{paramType}", "required": {boolean} }
];

const Validator = z.object({
    {paramName}: {zodType}
});

export default new HTTPEndpoint<{EndpointInPascalCase}HTTPEndpointInput>({
    inputValidator: Validator,
    params: Params,
    exec: {endpointInCamelCase},
    description: "{One-line description}"
});
```

- The import alias for the endpoint function is the endpoint name in camelCase.
- The `Params` array order must match the function argument order.

## Zod Type Mapping

| TypeScript type  | Zod validator          | Params `type` |
|------------------|------------------------|---------------|
| `string`         | `z.string()`           | `"string"`    |
| `number`         | `z.number()`           | `"number"`    |
| `boolean`        | `z.boolean()`          | `"boolean"`   |
| `string[]`       | `z.array(z.string())`  | `"array"`     |
| `number[]`       | `z.array(z.number())`  | `"array"`     |
| optional `T`     | `z.{type}().optional()`| (required: false) |
| nested object    | `z.object({ ... })`   | `"object"`    |

When a parameter is optional, set `"required": false` in `Params` and chain `.optional()` on the Zod validator. Mark the TypeScript type with `?`.

## HTTPResponse

Import from `@features/http/types/HTTPResponse.type`:

- `HTTPResponse.Ok(message, data?)` — 200
- `HTTPResponse.NotFound(endpoint)` — 404
- `HTTPResponse.InternalServerError(error)` — 500
