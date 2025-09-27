import debug from "debug";
import { Logger } from "./types/Logger.type";
import { Environment } from "@features/env";

const { bold, green, red, yellow } = require("chalk");

export default class LogsFeature {
    static #logger = LogsFeature.logger("@modules/logs");
    static debugLevel = () => parseInt(Environment.DebugLevel || "1");

    static logger (name: string): Logger {
        const _logger = debug(name);
        _logger.log = console.log.bind(console);
        
        return {
            log: _logger,
            ok: (...args) => _logger(green("✔"), ...args),
            warn: (msg, ...args) => _logger(yellow("Warning: " + msg), ...args),
            error: (msg, ...args) => _logger(bold(red(msg)), ...args),
            debug: (msg, ...args) => this.debugLevel() > 1 && _logger(msg, ...args),
        };
    }

    static init (pattern: string = "@*") {
        debug.enable(pattern);

        this.#logger.ok("Logs module initialized");
    }
}