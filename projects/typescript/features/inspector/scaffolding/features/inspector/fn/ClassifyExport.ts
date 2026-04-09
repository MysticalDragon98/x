import { TokenMetadata } from "@features/storage/decorators/token.decorator";
import { ExportKinds } from "../enums/ExportKinds";

const SUBFOLDER_TO_KIND: Record<string, ExportKinds> = {
    classes: ExportKinds.Class,
    fn: ExportKinds.Function,
    enums: ExportKinds.Enum,
    types: ExportKinds.Type,
    entities: ExportKinds.Entity,
    values: ExportKinds.Value,
};

export function ClassifyExport(subfolder: string, value: unknown): ExportKinds | null {
    const kind = SUBFOLDER_TO_KIND[subfolder];

    if (!kind) return null;

    if (subfolder === "types") return ExportKinds.Type;

    if (subfolder === "enums") {
        return typeof value === "object" && value !== null ? ExportKinds.Enum : null;
    }

    if (subfolder === "fn") {
        return typeof value === "function" ? ExportKinds.Function : null;
    }

    if (subfolder === "entities" || subfolder === "values") {
        return typeof value === "function" && TokenMetadata.has(value) ? kind : null;
    }

    if (subfolder === "classes") {
        return typeof value === "function" ? ExportKinds.Class : null;
    }

    return null;
}
