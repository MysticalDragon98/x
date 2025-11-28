import { Library } from "../../classes/Library";
import analyze from "../../../../src/ai/libraries/image/build/analyze.toolc";
//* Imports

//? 
export const Image = new Library({
    name: "image",
    actions: [
        analyze,
        //* Tools
    ]
});