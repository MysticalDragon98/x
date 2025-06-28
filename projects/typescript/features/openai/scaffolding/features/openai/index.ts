import { OpenAI } from "openai";
import { EmbeddingsModel } from "./enums/EmbeddingsModel.enum";
import { Mindset } from "./classes/mindset";
import { ConversationRole } from "./enums/ConversationRole.enum";
import { Crypto } from "@features/crypto";
import { Embeddings } from "./classes/Embeddings";
import LogsFeature from "@features/logs";
import { Toolset } from "./classes/Toolset";
import { Conversation } from "./classes/Conversation";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export default class OpenAIFeature {

    static #logger = LogsFeature.logger("@modules/openai");
    static #openai: OpenAI;

    static init ({ apiKey }: { apiKey: string }) {
        this.#openai = new OpenAI({ apiKey });
        this.#logger.ok("OpenAI module initialized");
    }

    static async embeddings (input: string, model: EmbeddingsModel) {
        const result = await OpenAIFeature.#openai.embeddings.create({
            model: model,
            input
        });

        const hash = Crypto.sha256(input);

        return new Embeddings(hash, result.data[0].embedding, input);
    }

    static async prompt<T = string> (mindset: Mindset, prompt: string, tools?: Toolset) {
        const conversation = Conversation.fromPrompt(mindset, prompt, tools);
        const choice = await this.chatCompletion(mindset, conversation.messages, conversation.tools);

        if (mindset.schema && choice?.message.content) {
            return JSON.parse(choice?.message.content) as T;
        }

        return choice?.message.content as T;
    }

    static async chatCompletion (mindset: Mindset, messages: ChatCompletionMessageParam[], tools?: Toolset) {
        const choice = await this.#openai.chat.completions.create({
            model: mindset.model,
            messages,
            response_format: mindset.schema && {
                type: "json_schema",
                json_schema: {
                    name: "response",
                    schema: mindset.schema
                }
            },
            tools: tools? tools.tools.map(tool => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            })) : undefined
        });

        return choice.choices[0];
    }
    
}