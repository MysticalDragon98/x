import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ZodFeature from "../zod/zod.feature";

export default class TelegramFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly zod = this.inject<ZodFeature>(ZodFeature);

    name () { return "telegram"; }
    version () { return "0.0.2"; }


    async init () {
        this.project.installDev([
            "telegraf",
            "handlebars"
        ])
    }

}