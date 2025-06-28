import dotenv from "dotenv";
import { CustomErrors, $assert } from "@features/errors";
import { resolve } from "path";

export const EnvErrors = CustomErrors({
    EnvvarNotFound: "The environment variable {name} was not found."
});

const {parsed: env} = dotenv.config({ path: resolve(__dirname, "../../.env") }); 

export const Environment = {
    DebugLevel: env!.DEBUG_LEVEL,
    OpenAiKey: env!.OPEN_AI_KEY!,
    //* Envvars
};

$assert(typeof Environment.OpenAiKey !== 'undefined', EnvErrors.EnvvarNotFound, { name: 'OPEN_AI_KEY' });
//* Checks