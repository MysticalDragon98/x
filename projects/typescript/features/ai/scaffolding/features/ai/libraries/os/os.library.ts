import { Library } from "../../classes/Library";
import shutdown from "../../../../src/ai/libraries/os/build/shutdown.toolc";
//* Imports

//? 
export const Os = new Library({
    name: "os",
    actions: [
        shutdown,
        //* Tools
    ]
});