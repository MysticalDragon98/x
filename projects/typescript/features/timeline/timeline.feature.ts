import { Feature } from "../../../../src/modules/projects/feature";
import { TimelineFile } from "./timeline-file";
import GeneratorFeature, { GeneratorAction } from "../generator/generator.feature";
import TypescriptProject from "../..";

export class TimelineFeature extends Feature<TypescriptProject> {
    readonly #generator = this.inject(GeneratorFeature);
    #file?: TimelineFile;

    name () { return "timeline"; }
    version () { return "0.0.0"; }

    async init () {
        const timelinePath = await this.metaSubpath("timeline");
        this.#file = new TimelineFile(timelinePath);

        this.#generator.addGenerator("timeline:line", {
            description: "Add a line to the timeline",
            prompts: [
                { type: "input", name: "text", message: "What is the text of the line?" }
            ],
            actions: [
                GeneratorAction.append(
                    timelinePath,
                    "",
                    "{{text}}"
                )
            ]
        })

        await this.#file?.add("This timeline was created 🥳");
    }

    add (text: string) {
        this.#file?.add(text);
    }
}