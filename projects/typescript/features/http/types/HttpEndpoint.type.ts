import { HttpEndpointParam } from "./HttpEndpointParam.type";

export type HttpEndpoint = {
    route: string,
    endpoint: string;
    path: string;
    comments: string;
    params: HttpEndpointParam[]
}