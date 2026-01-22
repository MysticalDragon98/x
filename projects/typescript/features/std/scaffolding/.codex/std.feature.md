# Project Structure Rules

1) Development source files live under `src/`.
2) The project is organized into modules at `src/modules/{module-name}`.
3) Feature code (local libraries) lives in `features/`. These can be modified, but are mostly static.
4) Use the `x std:module {module-name}` skill whenever you need to create one, NEVER do mkdir -p src/modules/{module-name} to create one
5) Module names are always lower case with connecting-dashes