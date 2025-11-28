import mongoose from "mongoose";
import { Environment } from "../env";
import LogsFeature from "../logs";

const logger = LogsFeature.logger("@modules/mongo");

export class MongoFeature {

    static async init (url = Environment.MongoUrl) {
        await mongoose.connect(url);

        logger.ok("MongoDB module initialized");
    }
}