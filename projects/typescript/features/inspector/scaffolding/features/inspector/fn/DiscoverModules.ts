import { readdirSync, statSync } from "fs";
import { join } from "path";
import { ClassifyExport } from "./ClassifyExport";
import { ReadSchema } from "./ReadSchema";
import { ExtractParamsSchema } from "./ExtractParamsSchema";
import { ExportDescriptor } from "../types/ExportDescriptor";
import { ExportKinds } from "../enums/ExportKinds";

const KNOWN_SUBFOLDERS = ["classes", "fn", "enums", "types", "entities", "values"];
const SKIP_MODULES = ["inspector", "json_rpc"];

type DiscoveredModule = {
    name: string;
    exports: { subfolder: string; descriptor: ExportDescriptor; ref: unknown }[];
};

export async function DiscoverModules(): Promise<DiscoveredModule[]> {
    const modulesDir = join(__dirname, "../../../src/modules/");
    const moduleDirs = readdirSync(modulesDir).filter(name =>
        !SKIP_MODULES.includes(name) && statSync(join(modulesDir, name)).isDirectory()
    );

    const discovered: DiscoveredModule[] = [];

    for (const modName of moduleDirs) {
        const modPath = join(modulesDir, modName);
        const subfolders = readdirSync(modPath).filter(name =>
            KNOWN_SUBFOLDERS.includes(name) && statSync(join(modPath, name)).isDirectory()
        );

        const exports: DiscoveredModule["exports"] = [];

        for (const subfolder of subfolders) {
            const files = readdirSync(join(modPath, subfolder))
                .filter(f => f.endsWith(".ts") && f !== "index.ts");

            for (const file of files) {
                const filePath = join(modPath, subfolder, file);
                const mod = await import(filePath);
                const exportName = file.replace(/\.ts$/, "");
                const value = mod[exportName] ?? mod.default;

                if (value === undefined) continue;

                const kind = ClassifyExport(subfolder, value);

                if (!kind) continue;

                const descriptor: ExportDescriptor = { name: exportName, kind };

                if (kind === ExportKinds.Function) {
                    descriptor.params = ExtractParamsSchema(filePath, exportName);
                }

                if (kind === ExportKinds.Class) {
                    descriptor.staticMethods = Object.getOwnPropertyNames(value)
                        .filter(key => typeof value[key] === "function" && key !== "prototype" && key !== "length" && key !== "name")
                        .map(key => ({ name: key, params: ExtractParamsSchema(filePath, exportName, key) }));
                }

                if (kind === ExportKinds.Enum) {
                    const members: Record<string, string | number> = {};

                    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
                        if (typeof val === "string" || typeof val === "number") {
                            members[key] = val;
                        }
                    }

                    descriptor.members = members;
                }

                if (kind === ExportKinds.Entity || kind === ExportKinds.Value) {
                    descriptor.schema = ReadSchema(value);
                }

                exports.push({ subfolder, descriptor, ref: value });
            }
        }

        discovered.push({ name: modName, exports });
    }

    return discovered;
}
