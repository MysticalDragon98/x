import { Library } from "../../classes/Library";
import screenshot from "../../../../src/ai/libraries/screen/build/screenshot.toolc";
//* Imports

//? 
export const Screen = new Library({
    name: "screen",
    actions: [
        screenshot,
        //* Tools
    ]
});