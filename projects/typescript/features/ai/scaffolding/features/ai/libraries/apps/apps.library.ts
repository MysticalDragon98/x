import { Library } from "../../classes/Library";
import open from "../../../../src/ai/libraries/apps/build/open.toolc";
//* Imports

//? 
export const Apps = new Library({
    name: "apps",
    actions: [
        open,
        //* Tools
    ]
});