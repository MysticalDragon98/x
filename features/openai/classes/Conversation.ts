import { ChatCompletion, ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat";
import { Mindset } from "./mindset";
import { Toolset } from "./Toolset";
import OpenAIFeature from "..";
import { $assert, CustomErrors } from "@/features/errors";

const Errors = CustomErrors({
    NoToolFound: "The engine tried to use a tool named {name} but no tool with that name was found."
})
export class Conversation {

    readonly mindset: Mindset;
    readonly messages: ChatCompletionMessageParam[] = [];
    readonly tools?: Toolset;

    constructor (mindset: Mindset, tools?: Toolset) {
        this.mindset = mindset;
        this.tools = tools;
        this.addMessage({ role: "system", content: mindset.intent });
    }

    async run<T = string> (): Promise<T> {
        const result = await OpenAIFeature.chatCompletion(this.mindset, this.messages, this.tools);
        this.addMessage(result.message);

        if (result.finish_reason === "tool_calls") {
            const calls = result.message.tool_calls;
            const responses = await this.executeToolCalls(calls ?? []);

            for (const response of responses) {
                this.addToolMessage(response.id, JSON.stringify(response.response));
            }
            return await this.run();
        }

        
        if (this.mindset.schema && result?.message.content) {
            return JSON.parse(result?.message.content) as T;
        }

        return result?.message.content as T;
    }

    async executeToolCalls (calls: ChatCompletionMessageToolCall[]) {
        return await Promise.all(calls.map(call => this.executeToolCall(call)));
    }

    async executeToolCall (call: ChatCompletionMessageToolCall) {
        const tool = this.tools?.get(call.function.name);

        $assert(tool, Errors.NoToolFound, { name: call.function.name });
        const args = JSON.parse(call.function.arguments);

        return {
            id: call.id,
            response: await tool!.callback(args)
        }
    }

    addUserMessage (message: string) {
        this.addMessage({ role: "user", content: message });
    }

    addAssistantMessage (message: string) {
        this.addMessage({ role: "assistant", content: message });
    }

    addToolMessage (id: string, message: string) {
        this.addMessage({
            role: "tool",
            content: message,
            tool_call_id: id
        });
    }

    addMessage (message: ChatCompletionMessageParam) {
        this.messages.push(message);
    }

    static fromPrompt (mindset: Mindset, prompt: string, tools?: Toolset) {
        const conversation = new Conversation(mindset, tools);
        conversation.addUserMessage(prompt);

        return conversation;
    }
}