import { TextFile } from "../../../../src/modules/files/text-file";

export class TimelineFile {

    readonly file: TextFile;

    constructor (readonly path: string) {
        this.file = new TextFile(path);
    }

    async add (text: string) {
        await this.file.appendLine(`${this.timestamp()} ${text}`);
    }

    timestamp () {
        const date = new Date();

        return `[${Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(date)}]`;
    }
}