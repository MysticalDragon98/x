# Env feature

1) Environment variables are written in .env in UPPER_CASE
2) Environment variables are validated and stored in features/env/index.ts and exported through the Environment envvar where the key is the same ennvar name but with UpperSnakeCase. ex HTTP_PORT => Environment.HttpPort
3) Creating an envvar is only possible via `x env:var {EnvvarName} [required]`