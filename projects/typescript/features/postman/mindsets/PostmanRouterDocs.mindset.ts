import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";
import { readFileSync } from "fs";

export const PostmanRouterDocsMindset = new Mindset({
    model: PromptModel.Default,
    intent: readFileSync(__dirname + "/PostmanRouterDocs.md", "utf-8")
})