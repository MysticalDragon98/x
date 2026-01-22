# HTTP Feature

Use the following rules whenever you are interacting with the HTTP functionalities

1) HTTP Endpoints belongs to modules, and are defined in src/modules/{module}/http/{endpoint}.http-endpoint.ts
2) Endpoint paths are equivalent to /{module}/{endpoint}
3) Endpoints are default exported functions with the following structure

```
export default [async] function {endpointInCamelCase}HTTPEndpoint (...args) {

}
```

4) All arguments are mapped to function args names and type checked before going into the function, no type validations are required
5) Creation of endpoints must always be done using `x http:endpoint {module} {endpoint}`, this will create the scaffolding. NEVER CREATE ENDPOINTS OTHER WAY
6) After modifying the arguments of an endpoint you must run `x http:compile {module} {endpoint}` to update the reflection validators