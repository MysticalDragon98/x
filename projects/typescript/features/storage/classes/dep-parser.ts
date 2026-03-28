export class DepParser {
    static parseEntityDeps(source: string): string[] {
        const matches: string[] = [];
        const regex = /from\s+['"][^'"]*\/entities\/([^/'"]+)\.entity['"]/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(source)) !== null) {
            matches.push(match[1]);
        }

        return [...new Set(matches)];
    }

    static parseDataTypeDeps(source: string): string[] {
        const matches: string[] = [];
        const regex = /from\s+['"][^'"]*\/data-type\/([^/'"]+)\.data-type['"]/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(source)) !== null) {
            matches.push(match[1]);
        }

        return [...new Set(matches)];
    }
}
