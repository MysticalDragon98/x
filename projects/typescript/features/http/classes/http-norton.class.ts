import { Folder } from "@/features/fs/classes/folder";
import { FileHandler } from "@/features/fs/classes/file-handler";
import { FSHashTracker } from "@/features/fs/classes/fs-hash-tracker";

export class HTTPNorton {

    static #tracker: FSHashTracker = new FSHashTracker('.meta/http-endpoints.json');

    static async getExistingEndpointFiles () {
        const root = new Folder(process.cwd());
        const modules = await root
            .subfolder('src')
            .subfolder('modules')
            .directories();
        
        const endpointsFile: FileHandler[] = [];

        for (const module of modules) {
            const http = module.subfolder('http');
            const folderFile = await http.files()
                .catch(() => []);
            const endpoints = folderFile
                .filter(file => file.path.endsWith(".http-endpoint.ts"));
            
            endpointsFile.push(...endpoints);
        }

        return endpointsFile;
    }

    static async getChangedEndpointFiles () {
        const files = await HTTPNorton.getExistingEndpointFiles();
        const changedFiles: FileHandler[] = [];

        await Promise.all(files.map(async file => {
            if (await this.#tracker.fileChanged(file)) {
                changedFiles.push(file);
            }
        }));

        return changedFiles;
    }

    static async syncFileHash (path: string) {
        await this.#tracker.updateHash(path);
    }

}