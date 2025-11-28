import GLib from "gi://GLib?version=2.0";
import { $assert, CustomErrors } from "../errors";

const Errors = CustomErrors({
    EnvironmentVariableNotFound: (variable: string) => `Environment variable ${variable} not found.`
});

export const Environment = {
    //* Variables
};

//* Validations