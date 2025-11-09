import { HTTPEndpoint } from "./http-endpoint.class"
import express from "express";
import cors from "cors";
import { parse } from "url";
import { HTTPResponse } from "../types/HTTPResponse.type";
import { CustomError, CustomErrors } from "@/features/errors";

const Errors = CustomErrors({
    InternalServerError: () => "Internal server error"
});

type EndpointTree = {
    [module: string]: {
        [endpoint: string]: HTTPEndpoint<any>
    }
}

export class HTTPServer {
    readonly endpoints: EndpointTree;

    constructor (endpoints: EndpointTree) {
        this.endpoints = endpoints;
    }

    start (port: string) {
        const app = express();

        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(cors());
        app.use(async (req, res) => {
            const { url, method } = req;
            const URL = parse(url).pathname;
            const path = URL?.split('/').slice(1) || [];
            const body = method === "GET"? req.query : req.body;

            const endpoint = this.getEndpoint(path);

            if (!endpoint) {
                this.sendResponse(res, HTTPResponse.NotFound(path.join('/')));
                return;
            }

            try {
                const result = await endpoint.exec(body);

                if (!(result instanceof HTTPResponse)) {
                    this.sendResponse(res, HTTPResponse.Ok("", result));
                    return;
                }
                
                this.sendResponse(res, result);
            } catch (exc) {
                console.error(exc);

                if (Array.isArray(exc) && exc.every(err => err instanceof CustomError)) {
                    this.sendResponse(res, HTTPResponse.InternalServerError(exc));
                    return;
                }

                if (exc instanceof CustomError) {
                    this.sendResponse(res, HTTPResponse.InternalServerError(exc));
                    return;
                }

                this.sendResponse(res, HTTPResponse.InternalServerError(Errors.InternalServerError()));
            }
        });

        return new Promise((resolve, reject) => {
            app.listen(port, (error) => {
                if (error) reject(error);
                else resolve(app);
            });
        });
    }

    getEndpoint (path: string[]) {
        const [ module, endpoint ] = path;

        return this.endpoints[module]?.[endpoint];
    }

    sendResponse (res: express.Response, response: HTTPResponse) {
        res.status(response.status).json(response.body);
    }
}