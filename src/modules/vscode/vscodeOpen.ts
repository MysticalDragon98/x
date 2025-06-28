import { Shell } from "../shell/shell";

export default async function vscodeOpen (path: string, { line = 0, character = 0 }: { line?: number, character?: number } = {}) {
    try {
        const consoleName = Shell.shellName();

        if (consoleName === "code" || consoleName === "default") {
            if (line || character) {
                await Shell.exec(`code -g "${path}:${line}:${character}"`)
            } else {
                await Shell.exec(`code "${path}"`);
            }
        } else if (consoleName === "java") {
            if (line || character) {
                await Shell.exec(`webstorm --line ${line} --column ${character} ${path}`)
            } else {
                await Shell.exec(`webstorm ${path}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}
