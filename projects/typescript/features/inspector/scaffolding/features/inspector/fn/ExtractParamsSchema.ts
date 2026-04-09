import ts from "typescript";
import { join } from "path";
import { JsonSchema } from "../types/JsonSchema";

let program: ts.Program | undefined;
let checker: ts.TypeChecker | undefined;

function ensureProgram(): ts.TypeChecker {
    if (checker) return checker;

    const configPath = join(__dirname, "../../../tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, join(__dirname, "../../.."));

    program = ts.createProgram(parsed.fileNames, parsed.options);
    checker = program.getTypeChecker();

    return checker;
}

function typeToSchema(type: ts.Type, tc: ts.TypeChecker, depth: number): JsonSchema {
    if (depth > 5) return {};

    if (type.flags & ts.TypeFlags.String) return { type: "string" };
    if (type.flags & ts.TypeFlags.Number) return { type: "number" };
    if (type.flags & ts.TypeFlags.Boolean) return { type: "boolean" };
    if (type.flags & ts.TypeFlags.Undefined || type.flags & ts.TypeFlags.Void) return {};

    if (type.isStringLiteral()) return { type: "string", enum: [type.value] };
    if (type.isNumberLiteral()) return { type: "number", enum: [type.value] };

    if (type.isUnion()) {
        const filtered = type.types.filter(t => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)));

        const enumValues: (string | number)[] = [];
        let allLiterals = true;

        for (const member of filtered) {
            if (member.isStringLiteral()) enumValues.push(member.value);
            else if (member.isNumberLiteral()) enumValues.push(member.value);
            else { allLiterals = false; break; }
        }

        if (allLiterals && enumValues.length > 0) return { enum: enumValues };
        if (filtered.length === 1) return typeToSchema(filtered[0], tc, depth);

        return {};
    }

    if (tc.isArrayType(type)) {
        const typeArgs = tc.getTypeArguments(type as ts.TypeReference);

        if (typeArgs.length) return { type: "array", items: typeToSchema(typeArgs[0], tc, depth + 1) };

        return { type: "array" };
    }

    const properties = type.getProperties();

    if (properties.length > 0) {
        const props: Record<string, JsonSchema> = {};
        const required: string[] = [];

        for (const prop of properties) {
            const declaration = prop.valueDeclaration ?? prop.declarations?.[0];

            if (!declaration) continue;

            const propType = tc.getTypeOfSymbolAtLocation(prop, declaration);
            props[prop.name] = typeToSchema(propType, tc, depth + 1);

            if (!(prop.flags & ts.SymbolFlags.Optional)) {
                required.push(prop.name);
            }
        }

        const schema: JsonSchema = { type: "object", properties: props };

        if (required.length > 0) schema.required = required;

        return schema;
    }

    return {};
}

function findMethod(sourceFile: ts.SourceFile, exportName: string, methodName?: string): ts.SignatureDeclaration | undefined {
    let result: ts.SignatureDeclaration | undefined;

    ts.forEachChild(sourceFile, (node) => {
        if (result) return;

        if (methodName) {
            if (ts.isClassDeclaration(node) && node.name?.text === exportName) {
                for (const member of node.members) {
                    if (ts.isMethodDeclaration(member) && (member.name as ts.Identifier).text === methodName) {
                        result = member;
                    }
                }
            }
        } else {
            if (ts.isFunctionDeclaration(node) && node.name?.text === exportName) {
                result = node;
            }
        }
    });

    return result;
}

export function ExtractParamsSchema(filePath: string, exportName: string, methodName?: string): JsonSchema {
    const tc = ensureProgram();
    const sourceFile = program!.getSourceFile(filePath);
    const empty: JsonSchema = { type: "object", properties: {} };

    if (!sourceFile) return empty;

    const declaration = findMethod(sourceFile, exportName, methodName);

    if (!declaration?.parameters.length) return empty;

    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const param of declaration.parameters) {
        if (!ts.isIdentifier(param.name)) continue;

        const paramName = param.name.text;
        const paramType = tc.getTypeAtLocation(param);

        properties[paramName] = typeToSchema(paramType, tc, 0);

        if (!param.questionToken && !param.initializer) {
            required.push(paramName);
        }
    }

    const schema: JsonSchema = { type: "object", properties };

    if (required.length > 0) schema.required = required;

    return schema;
}
