import { join, dirname } from "path";
import { mkdir, writeFile } from "fs/promises";
import { JSONFile } from "@/src/modules/files/json-file";

export type StorageItemType = "entity" | "data-type";

export type StorageMeta = {
    name: string;
    type: StorageItemType;
    deps: {
        entities: string[];
        dataTypes: string[];
    };
};

export class StorageRepo {
    constructor(readonly root: string) {}

    sourcePath(name: string, type: StorageItemType): string {
        if (type === "entity") {
            return join(this.root, "entities", `${name}.entity.ts`);
        }
        return join(this.root, "data-types", `${name}.data-type.ts`);
    }

    metaPath(name: string, type: StorageItemType): string {
        if (type === "entity") {
            return join(this.root, "entities", `${name}.meta.json`);
        }
        return join(this.root, "data-types", `${name}.meta.json`);
    }

    async exists(name: string, type: StorageItemType): Promise<boolean> {
        return Bun.file(this.sourcePath(name, type)).exists();
    }

    async readSource(name: string, type: StorageItemType): Promise<string> {
        return Bun.file(this.sourcePath(name, type)).text();
    }

    async writeSource(name: string, type: StorageItemType, content: string): Promise<void> {
        const path = this.sourcePath(name, type);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, content);
    }

    async readMeta(name: string, type: StorageItemType): Promise<StorageMeta> {
        return JSONFile.read<StorageMeta>(this.metaPath(name, type));
    }

    async writeMeta(meta: StorageMeta): Promise<void> {
        await new JSONFile(this.metaPath(meta.name, meta.type)).write(meta);
    }
}
