import { HttpEndpoint } from "./HttpEndpoint.type";

export type HttpRoute = {
    name: string;
    endpoints: HttpEndpoint[];
}