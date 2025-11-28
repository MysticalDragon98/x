import { Library } from "../../classes/Library";
import time from "../../../../src/ai/libraries/time/build/time.toolc";
import date from "../../../../src/ai/libraries/time/build/date.toolc";
//* Imports

//? 
export const Time = new Library({
    name: "time",
    actions: [
        time,
        date,
        //* Tools
    ]
});