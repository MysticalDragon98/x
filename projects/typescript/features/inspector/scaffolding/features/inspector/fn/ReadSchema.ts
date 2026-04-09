import { TokenMetadata } from "@features/storage/decorators/token.decorator";
import { FieldMetadata } from "@features/storage/decorators/field.decorator";
import { ExportDescriptor } from "../types/ExportDescriptor";

export function ReadSchema(constructor: any): ExportDescriptor["schema"] | undefined {
    const tokenMeta = TokenMetadata.get(constructor);

    if (!tokenMeta) return undefined;

    const fieldMeta = FieldMetadata.get(constructor.prototype);

    return {
        id: tokenMeta.id,
        fields: fieldMeta
            ? Object.fromEntries(
                Object.entries(fieldMeta).map(([name, f]) => [name, {
                    type: f.class?.name ?? "unknown",
                    array: f.array,
                    required: f.required,
                    index: !!f.index,
                    unique: f.unique,
                }])
            )
            : undefined,
    };
}
