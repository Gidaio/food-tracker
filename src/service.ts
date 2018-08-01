import { HTTPError } from "./errors";

import Database from "better-sqlite3";
import express from "express";
import { LoggerInstance } from "winston";

export abstract class Service {
    protected database: Database;
    protected logger: LoggerInstance;

    public routes: express.Router;

    public constructor(database: Database, logger: LoggerInstance) {
        this.database = database;
        this.logger = logger;

        this.createTables();

        this.routes = express.Router();
        this.setRoutes();
    }

    protected abstract createTables(): void;
    protected abstract setRoutes(): void;

    protected endpoint<T, K>(validator: (body: any) => T, main: (input: T) => K): express.RequestHandler {
        return (request, response) => {
            response.setHeader("Content-Type", "application/json");

            try {
                this.logger.debug("Validating input...");
                const validatedInput = validator(request.body);

                this.logger.debug("Doing the function...");
                const output = main(validatedInput);

                this.logger.debug("Sending it back!");
                response.status(200).send(output);
            }
            catch (error) {
                if (!(error instanceof HTTPError)) {
                    this.logger.error(error.message);
                    throw error;
                }
                else {
                    this.logger.error(error.message);
                    response.status(error.Status).send({ error: error.message });
                }
            }
        };
    }
}
