import { mkdir } from "fs/promises";
import { join } from "path";

type FileTree = string[] | {
    [path: string]: FileTree
}
export class FsUtils {
    static async createDirs (...paths: string[]) {
        await Promise.all(paths.map((path) => mkdir(path, { recursive: true })));
    }

    static async createTree(tree: FileTree, baseDir = ""): Promise<void> {
        if (Array.isArray(tree)) {
            // Treat strings as folder names, not files
            await Promise.all(
                tree.map(async dir => {
                    const fullPath = join(baseDir, dir);
                    await mkdir(fullPath, { recursive: true });
                })
            );
        } else {
            await Promise.all(
                Object.entries(tree).map(async ([dir, subtree]) => {
                    const fullPath = join(baseDir, dir);
                    await mkdir(fullPath, { recursive: true });
                    await FsUtils.createTree(subtree, fullPath);
                })
            );
        }
    }
}