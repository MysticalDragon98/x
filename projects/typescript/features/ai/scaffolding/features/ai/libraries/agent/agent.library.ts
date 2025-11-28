import { Library } from "../../classes/Library";
import say from "../../../../src/ai/libraries/agent/build/say.toolc";
//* Imports

//? 
export const Agent = new Library({
    name: "agent",
    actions: [
        say,
        //* Tools
    ]
});