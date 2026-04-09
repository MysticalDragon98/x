import { CustomErrors, $assert } from "@features/errors";
import LogsFeature from "@features/logs";
import { JsonRpcServer } from "@modules/json_rpc";
import { BuildModuleTree } from "../fn/BuildModuleTree";
import { ExecuteCall } from "../fn/ExecuteCall";
import { ModuleTree } from "../types/ModuleTree";

const Errors = CustomErrors({
    ModuleNotFound: (name: string) => `Module "${name}" not found`,
    KindNotFound: (module: string, kind: string) => `Kind "${kind}" not found in module "${module}"`,
    ExportNotFound: (module: string, kind: string, name: string) => `Export "${name}" not found in ${module}/${kind}`,
    ReadNotAllowed: (kind: string) => `Kind "${kind}" is not readable — use "enums", "types", "entities", or "values"`,
});

const logger = LogsFeature.logger("@features/inspector");

export class Inspector {
    static #tree: ModuleTree = {};
    static #refs = new Map<string, unknown>();

    static async init() {
        const { tree, refs } = await BuildModuleTree();

        this.#tree = tree;
        this.#refs = refs;

        JsonRpcServer.register("inspector.enumerate", (params) => this.#enumerate(params));
        JsonRpcServer.register("inspector.execute", (params) => this.#execute(params));
        JsonRpcServer.register("inspector.read", (params) => this.#read(params));

        const moduleCount = Object.keys(tree).length;
        const exportCount = Object.values(tree).reduce(
            (sum, mod) => sum + Object.values(mod).reduce((s, arr) => s + (arr?.length ?? 0), 0), 0
        );

        logger.ok(`Registered ${exportCount} exports from ${moduleCount} modules`);
    }

    static #enumerate(params: Record<string, unknown>) {
        const moduleName = params.module as string | undefined;

        if (!moduleName) return this.#tree;

        $assert(this.#tree[moduleName], Errors.ModuleNotFound(moduleName));

        return { [moduleName]: this.#tree[moduleName] };
    }

    static async #execute(params: Record<string, unknown>) {
        const { module: moduleName, kind, name, method, args } = params as {
            module: string; kind: string; name: string; method?: string; args?: unknown[];
        };

        $assert(this.#tree[moduleName], Errors.ModuleNotFound(moduleName));

        const ref = this.#refs.get(`${moduleName}.${kind}.${name}`);

        $assert(ref !== undefined, Errors.ExportNotFound(moduleName, kind, name));

        return ExecuteCall(ref, kind, name, method, args ?? []);
    }

    static #read(params: Record<string, unknown>) {
        const { module: moduleName, kind, name } = params as {
            module: string; kind: string; name: string;
        };

        const READABLE_KINDS = ["enums", "types", "entities", "values"];

        $assert(READABLE_KINDS.includes(kind), Errors.ReadNotAllowed(kind));
        $assert(this.#tree[moduleName], Errors.ModuleNotFound(moduleName));

        const moduleEntry = this.#tree[moduleName];
        const kindEntries = moduleEntry[kind as keyof typeof moduleEntry];

        $assert(kindEntries, Errors.KindNotFound(moduleName, kind));

        const descriptor = kindEntries!.find(d => d.name === name);

        $assert(descriptor, Errors.ExportNotFound(moduleName, kind, name));

        return descriptor;
    }
}
