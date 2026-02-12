import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";
import { readFileSync } from "fs";

export const PostmanCollectionGeneratorMindset = new Mindset({
    model: PromptModel.Default5,
    intent: readFileSync(__dirname + "/PostmanScriptsGenerator.md", "utf-8")
})