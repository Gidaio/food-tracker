import { Service } from "./service";

import Database from "better-sqlite3";
import express from "express"
import { LoggerInstance } from "winston";

export class RecipeService extends Service {
    public constructor(database: Database, logger: LoggerInstance) {
        super(database, logger);
    }

    public setRoutes(): express.Router {
        const router = express.Router();
        return router;
    }
}
