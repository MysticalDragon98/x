import { statSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { $assert, CustomErrors } from "../errors";
import { HTTPServer } from "./classes/http-server.class";
import LogsFeature from "../logs";
import { HTTPEndpoint } from "./classes/http-endpoint.class";

const log = LogsFeature.logger("@features/http");
const Errors = CustomErrors({
    HTTPEndpointNotFound: (name) => `The HTTP endpoint ${name} was not found in the {module} module.`, 
    InvalidHTTPEndpoint: (name) => `The HTTP endpoint ${name} is not a valid HTTPEndpoint.`
})

export class HTTPFeature {

    static server?: HTTPServer;

    static async init ({ port }: { port: string }) {
        const endpointsFolder = 'features/http/endpoints';
        const modules = await readdir(endpointsFolder);
        const modulePaths = modules
            .map(module => ({
                name: module,
                path: join(endpointsFolder, module)
            }))
            .filter(({ path }) => statSync(path).isDirectory())

        const endpoints: Record<string, Record<string, any>> = {}

        for (const { name: moduleName, path } of modulePaths) {
            const files = await readdir(path);
            const endpointFiles = files.filter(file => file.endsWith('.http-meta.ts'));

            const imports = await Promise.all(
                endpointFiles
                    .map((name) => ({
                        name: name.replace('.http-meta.ts', ''),
                        path: join(path, name)
                    }))
                    .map(async ({ name, path }) => ({
                        path,
                        module: await import(path),
                        name
                    }))  
            );

            for (const { module, path, name } of imports) {
                $assert(module.default instanceof HTTPEndpoint, Errors.InvalidHTTPEndpoint(path));

                endpoints[moduleName] = endpoints[moduleName] || {};
                endpoints[moduleName][name] = module.default;
            }

        }

        this.server = new HTTPServer(endpoints);
        await this.server.start(port);
        log.ok(`HTTP server started on port ${port}`);
    }


}