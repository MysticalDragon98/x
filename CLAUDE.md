# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build
- `npm run build` or `tsc` - Compiles TypeScript to JavaScript

### Development
- Run the CLI: `node cli.ts [command]` or `./cli.ts [command]`
- Use pnpm for dependency management in generated projects

## Architecture

This is a modular CLI framework called "X" that provides project scaffolding and feature management capabilities.

### Core Components

**CLI System (cli.ts)**
- Main entry point that handles command routing
- Supports both regular commands and feature-specific commands (format: `feature:command`)
- Uses minimist for argument parsing with JSON output support (`--json`)

**Project System**
- Abstract `Project` class in src/modules/projects/project.ts
- Projects are initialized with `project.json` configuration
- TypeScript project implementation in projects/typescript/index.ts
- Projects can have multiple features that extend functionality

**Feature System**
- Abstract `Feature` class in src/modules/projects/feature.ts
- Features live in projects/{type}/features/{name}/ directories
- Features have their own scaffolding, commands, and dependencies
- Feature injection system allows features to depend on other features
- Version tracking prevents duplicate installations

**Command Structure**
- Commands in src/commands/ (init.command.ts, add.command.ts)
- Feature commands in projects/{type}/features/{name}/commands/
- Uses FolderCLI for automatic command discovery and execution

### Key Patterns

1. **Scaffolding System**: Both projects and features use scaffolding directories that get copied to target locations
2. **JSON Configuration**: Projects maintain state in project.json with feature versions and folder mappings
3. **Debug Logging**: Uses debug package with namespace pattern `@features/{name}` and `@projects/{type}`
4. **CLI Result Pattern**: Commands return CLIResult objects with success/error states and structured data

### Feature Examples
Available TypeScript project features include: chroma (embeddings), crypto, errors, fs (file handling), generator (plop-based), logs, openai, queue, std (utilities), timeline.