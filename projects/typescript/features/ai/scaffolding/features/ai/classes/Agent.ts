import { BehaviorSubject, Subscription } from "rxjs";
import { Library } from "./Library";
import { LanguageCore } from "./LanguageCore";
import { $assert, CustomErrors } from "@/features/errors";
import { AgentStatus } from "../enums/AgentStatus";
import { AudioEngine } from "./AudioEngine";
import { ExecutionContext } from "./ExecutionContext";
import agentOptions from "../libraries";
import { RegexMatchers } from "./RegexMatchers";

const Errors = CustomErrors({
    ActionNotFound: (name: string) => `The action ${name} was not found.`
})

export interface AgentOptions {
    audio: {
        sources: string[]
    },
    matchers?: RegexMatchers,
    lib: Library[]
}

export class Agent {
    
    static #listeners: Subscription[] = [];
    static lib: Library[] = [];
    static $status = new BehaviorSubject<AgentStatus>(AgentStatus.Idle);
    static matchers: RegexMatchers;

    static init (matchers?: RegexMatchers) {
        for (const source of agentOptions.audio.sources) {
            AudioEngine.addSource(source);
        }

        Agent.#setupAudioEngine();
        Agent.lib = agentOptions.lib;
        Agent.matchers = matchers ?? new RegexMatchers([]);
    }

    static getAction (name: string) {
        const [ libName, actionName ] = name.split(".");

        const lib = this.lib.find(lib => lib.name === libName)!;
        $assert(lib, Errors.ActionNotFound(name));
        const action = lib.actions.find(action => action.name === actionName)!;
        $assert(action, Errors.ActionNotFound(name));

        return action;
    }

    static #setupAudioEngine () {
        this.#listeners.push(
            AudioEngine.$text.subscribe(async (text: string) => {
                LanguageCore.process(text);
            })
        );
    }

    static destroy () {
        this.#listeners.forEach(listener => listener.unsubscribe());
    }

    static getContext (self: any) {
        return self.context as ExecutionContext;
    }

}