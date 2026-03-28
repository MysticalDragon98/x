import { CLIResult } from "@/src/modules/cli/cli-result";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import TypescriptProject from "@/projects/typescript";
import StorageFeature from "../storage.feature";
import { StorageRepo, StorageItemType } from "../classes/storage-repo";

async function downloadOne(
    name: string,
    type: StorageItemType,
    targetModule: string,
    feature: StorageFeature,
    repo: StorageRepo,
    downloaded: Set<string>,
    warnings: string[]
): Promise<void> {
    const key = `${type}:${name}`;
    if (downloaded.has(key)) return;
    downloaded.add(key);

    const meta = await repo.readMeta(name, type);

    for (const dep of meta.deps.entities) {
        if (!await repo.exists(dep, "entity")) {
            warnings.push(`Dependency entity "${dep}" not found in storage, skipping`);
            continue;
        }
        await downloadOne(dep, "entity", targetModule, feature, repo, downloaded, warnings);
    }

    for (const dep of meta.deps.dataTypes) {
        if (!await repo.exists(dep, "data-type")) {
            warnings.push(`Dependency data-type "${dep}" not found in storage, skipping`);
            continue;
        }
        await downloadOne(dep, "data-type", targetModule, feature, repo, downloaded, warnings);
    }

    const targetPath = feature.sourcePath(targetModule, name, type);

    if (await Bun.file(targetPath).exists()) {
        warnings.push(`"${name}" already exists in module "${targetModule}", skipping`);
        return;
    }

    const content = await repo.readSource(name, type);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content);
}

export default async function downloadCommand(
    [name, moduleName]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: StorageFeature }
): Promise<CLIResult> {
    if (!name || !moduleName) {
        return CLIResult.error({ MissingArguments: "Both name and moduleName arguments are required" });
    }

    const moduleExists = await feature.std.config.existsModule(moduleName);
    if (!moduleExists) {
        return CLIResult.error({ ModuleNotFound: `Module "${moduleName}" not found` });
    }

    const repo = new StorageRepo(feature.storagePath());

    let type: StorageItemType;
    if (await repo.exists(name, "entity")) {
        type = "entity";
    } else if (await repo.exists(name, "data-type")) {
        type = "data-type";
    } else {
        return CLIResult.error({ NotFoundInStorage: `"${name}" not found in storage repository` });
    }

    const warnings: string[] = [];
    await downloadOne(name, type, moduleName, feature, repo, new Set(), warnings);

    return CLIResult.success(
        `✨ Successfully downloaded ${type} "${name}" into module "${moduleName}"!`,
        { name, type, moduleName, warnings }
    );
}
