import { ExportKinds } from "../enums/ExportKinds";
import { JsonSchema } from "./JsonSchema";

export type MethodDescriptor = {
    name: string;
    params: JsonSchema;
};

export type ExportDescriptor = {
    name: string;
    kind: ExportKinds;
    params?: JsonSchema;
    staticMethods?: MethodDescriptor[];
    members?: Record<string, string | number>;
    schema?: {
        id?: string;
        fields?: Record<string, {
            type: string;
            array: boolean;
            required: boolean;
            index: boolean;
            unique: boolean;
        }>;
    };
};
