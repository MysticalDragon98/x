import { DotPath } from "./DotPath.type";

export type TableQuery<T> = {
    filter?: Partial<T>;
    skip?: number;
    limit?: number;
    sort?: keyof T;
};