module.exports = {
    "description": "Add an environment variable",
    "prompts": [
        {
            "type": "input",
            "name": "name",
            "message": "What is the name of the environment variable?"
        },
        {
            "type": "confirm",
            "name": "required",
            "message": "Is this variable required?"
        }
    ],
    "actions": [
        {
            "type": "append",
            "path": "../../features/env/index.ts",
            "pattern": "//* Envvars",
            "template": "    {{pascalCase name}}: process.env.{{upperSnakeCase name}},"
        },
        {
            "type": "append",
            "path": "../../features/env/index.ts",
            "pattern": "//* Checks",
            "template": "{{#if required}}\n$assert(typeof Environment.{{pascalCase name}} !== 'undefined', EnvErrors.EnvvarNotFound, { name: '{{name}}' });\n{{/if}}"
        }
    ]
}