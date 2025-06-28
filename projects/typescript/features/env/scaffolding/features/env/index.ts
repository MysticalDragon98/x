import dotenv from "dotenv";
import { CustomErrors, $assert } from "@features/errors";

export const EnvErrors = CustomErrors({
    EnvvarNotFound: "The environment variable {name} was not found."
});

dotenv.config({ path: ".env" });

export const Environment = {
    //* Envvars
};

//* Checks