import { ExportDescriptor } from "./ExportDescriptor";

export type ModuleTree = {
    [moduleName: string]: {
        classes?: ExportDescriptor[];
        fn?: ExportDescriptor[];
        enums?: ExportDescriptor[];
        types?: ExportDescriptor[];
        entities?: ExportDescriptor[];
        values?: ExportDescriptor[];
    };
};
