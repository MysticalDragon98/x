import { DiscoverModules } from "./DiscoverModules";
import { ModuleTree } from "../types/ModuleTree";
import { ExportDescriptor } from "../types/ExportDescriptor";

type ModuleRegistry = {
    tree: ModuleTree;
    refs: Map<string, unknown>;
};

export async function BuildModuleTree(): Promise<ModuleRegistry> {
    const modules = await DiscoverModules();
    const tree: ModuleTree = {};
    const refs = new Map<string, unknown>();

    for (const mod of modules) {
        const entry: Record<string, ExportDescriptor[]> = {};

        for (const { subfolder, descriptor, ref } of mod.exports) {
            if (!entry[subfolder]) entry[subfolder] = [];

            entry[subfolder].push(descriptor);
            refs.set(`${mod.name}.${subfolder}.${descriptor.name}`, ref);
        }

        tree[mod.name] = entry;
    }

    return { tree, refs };
}
