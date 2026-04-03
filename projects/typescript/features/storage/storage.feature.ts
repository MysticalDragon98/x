import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ErrorsFeature from "../errors/errors.feature";
import UtilsFeature from "../utils/utils.feature";
import { resolve, join } from "path";
import * as dotenv from "dotenv";
import type { StorageItemType } from "./classes/storage-repo";

export default class StorageFeature extends Feature<TypescriptProject> {
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly errors = this.inject<ErrorsFeature>(ErrorsFeature);
    readonly utils = this.inject<UtilsFeature>(UtilsFeature);

    name () { return "storage"; }
    version () { return "0.1.4"; }

    async init () {}

    updatePaths(): string[] {
        return ["features/storage/**/*"];
    }

    storagePath(): string {
        const xRoot = resolve(__dirname, "../../../../");
        dotenv.config({ path: join(xRoot, ".env") });
        return process.env.STORAGE_PATH ?? join(xRoot, ".storage");
    }

    async detectType(moduleName: string, name: string): Promise<StorageItemType | null> {
        const mod = this.std.module(moduleName);
        if (await Bun.file(mod.subpath("entities", `${name}.entity.ts`)).exists()) {
            return "entity";
        }
        if (await Bun.file(mod.subpath("data-type", `${name}.data-type.ts`)).exists()) {
            return "data-type";
        }
        return null;
    }

    sourcePath(moduleName: string, name: string, type: StorageItemType): string {
        const mod = this.std.module(moduleName);
        return type === "entity"
            ? mod.subpath("entities", `${name}.entity.ts`)
            : mod.subpath("data-type", `${name}.data-type.ts`);
    }
}
