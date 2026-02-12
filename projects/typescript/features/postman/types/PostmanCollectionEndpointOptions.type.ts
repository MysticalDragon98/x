import { PostmanRequestBody } from "./PostmanCollectionJSON.type";

export type PostmanCollectionEndpointOptions = {
    name: string;
    method: string;
    url: string;

    parentPath?: string[];
    description?: string;

    headers?: Record<string, string>;
    query?: Record<string, string>;

    body?: PostmanRequestBody;

    auth?: any;

    preRequestScript?: string | string[];
    testScript?: string | string[];
}