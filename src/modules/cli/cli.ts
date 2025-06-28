import { CLIResult } from "./cli-result";

export abstract  class CLI {

    abstract exec (args: string[], context: any): CLIResult | Promise<CLIResult>;

}