import { Folder } from "./classes/folder";

export default class FsFeature {
    
    static folder (path: string) {
        return new Folder(path);
    }

}