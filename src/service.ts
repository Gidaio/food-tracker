import Database from "better-sqlite3";
import { LoggerInstance } from "winston";
import express from "express"

export abstract class Service {
    protected database: Database;
    protected logger: LoggerInstance;

    public routes: express.Router;

    public constructor(database: Database, logger: LoggerInstance) {
        this.database = database;
        this.logger = logger;

        this.routes = this.setRoutes();
    }

    protected abstract setRoutes(): express.Router;
}
