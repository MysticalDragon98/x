import { OpenAI } from "openai";
import { EmbeddingsModel } from "./enums/EmbeddingsModel.enum";
import { Mindset } from "./classes/mindset";
import { Crypto } from "@features/crypto";
import { Embeddings } from "./classes/Embeddings";
import LogsFeature from "@features/logs";
import { Toolset } from "./classes/Toolset";
import { Conversation } from "./classes/Conversation";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { Environment } from "../env";

export default class OpenAIFeature {

    static #logger = LogsFeature.logger("@modules/openai");
    static #openai: OpenAI;

    static init (apiKey: string = Environment.OpenAiKey) {
        if (this.#openai) return;
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

    static async imageAnalysis ({ mindset, prompt, image }: { mindset: Mindset, prompt: string, image: string }) {
        const choice = await this.#openai.responses.create({
            model: mindset.model,

            input: [
                {
                    type: "message",
                    role: "system",
                    content: mindset.intent
                },
                {
                    type: "message",
                    role: "user",
                    content: [
                        { type: "input_text", text: prompt },
                        {
                            type: "input_image",
                            image_url: `data:image/webp;base64,${image}`,
                            detail: "auto"
                        }
                    ]
                }
            ],
        });

        return choice.output_text;
    }

    static async chatCompletion (mindset: Mindset, messages: ChatCompletionMessageParam[], tools?: Toolset) {
        const choice = await this.#openai.chat.completions.create({
            model: mindset.model,
            messages,
            
            reasoning_effort: mindset.reasoning,
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

    static async webSearch (mindset: Mindset, query: string) {
        const result = await OpenAIFeature.#openai.responses.create({
            model: mindset.model,
            reasoning: mindset.reasoning && {
                effort: mindset.reasoning
            },
            tools: [{ type: "web_search" }],
            input: `${mindset.intent}: ${query}`
        });

        return result.output_text;
    }

    static async tts (text: string, instructions?: string) {
        const result = await OpenAIFeature.#openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            input: text,
            voice: "marin",
            instructions
        });

        return result.arrayBuffer();
    }
    
    static async stt (audio: Buffer) {
        const bytes = new Uint8Array(audio.buffer, audio.byteOffset, audio.byteLength);
        const file = await OpenAI.toFile(bytes, "audio.wav", { type: "audio/wav" });

        const result = await OpenAIFeature.#openai.audio.transcriptions.create({
            model: "whisper-1",
            file,
            language: "es"
        });

        return result.text;
    }

}