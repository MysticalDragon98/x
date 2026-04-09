# Project Structure Rules

1. Two root folders matter:
   - `src/`: application source code. Read and modify freely.
   - `features/`: local library code. Treat it like `node_modules`; do not read or modify it unless required. `src/`-only rules do not apply there.
2. All user code lives in `src/modules/`. Do not place application code outside modules.
3. Modules live at `src/modules/{module_name}` using `snake_case`.
4. Valid module subfolders are:
   - `types/{Type}.ts` in `UpperCamelCase`. Types only, no interfaces.
   - `enums/{Enum}.ts` in `UpperCamelCase`. Use plural names to avoid collisions.
   - `consts/{Const}.ts` in `$UpperCamelCase`.
   - `classes/{Class}.ts` in `UpperCamelCase` for non-persisted classes.
   - `fn/{Function}.ts` in `camelCase`.
   - `entities/{Name}.entity.ts` in `UpperCamelCase`.
   - `values/{Name}.value.ts` in `UpperCamelCase`.
5. `index.ts` barrel files are allowed at the module and subfolder level.
6. In `src/`, keep one exported value per file. Barrel `index.ts` re-exports are the exception.
7. Put the exported value first in the file.
8. Put non-exported dependencies below the exported value, ordered from higher abstraction to lower abstraction.
9. Always import feature code with `@features/...`, never `@/features/...`.
10. Be critical and surface user mistakes before coding.
11. Ask for clarification only when there is real ambiguity or the requested approach is impractical.
12. Avoid unnecessary confirmation loops.
