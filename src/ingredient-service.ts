import Database from "better-sqlite3";
import express from "express";
import { LoggerInstance } from "winston";

interface Quantity {
    amount: number;
    unit: "tsp" | "oz";
}

interface Ingredient {
    id: number;
    name: string;
    quantity: Quantity;
}

export class IngredientService {
    private database: Database;
    private logger: LoggerInstance;

    public routes: express.Router;

    public constructor(database: Database, logger: LoggerInstance) {
        this.database = database;
        this.logger = logger;

        this.routes = this.setRoutes();

        const createTable = database.prepare(`
            CREATE TABLE IF NOT EXISTS ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                amount INTEGER,
                unit TEXT
            );`);

        createTable.run();
    }

    private setRoutes(): express.Router {
        const router = express.Router();
        router.get("/", (request, response) => {
            this.logger.debug("GET request on ingredients.");

            const ingredients = this.getAll();

            this.logger.debug("Sending response.");

            response.setHeader("Content-Type", "application/json");
            response.status(200).send(JSON.stringify(ingredients));
        });

        router.post("/", (request, response) => {
            this.logger.debug(`POST request on ingredients with body ${JSON.stringify(request.body)}.`);

            const { name, quantity } = request.body as Ingredient;

            const id = this.create(name, quantity);

            this.logger.debug("Sending response.");

            response.setHeader("Content-Type", "application/json");
            response.status(200).send(JSON.stringify({ id, name, quantity }));
        });

        return router;
    }

    private create(name: string, quantity: Quantity): number {
        this.logger.debug(`Creating ingredient with name ${name} and quantity ${quantity.amount} ${quantity.unit}...`);

        const createIngredient = this.database.prepare(`
            INSERT INTO ingredients (name, amount, unit) VALUES (?, ?, ?);`);
        createIngredient.run(name, quantity.amount, quantity.unit);

        const getId = this.database.prepare("SELECT LAST_INSERT_ROWID();");
        const newId = getId.get();

        this.logger.debug(`Ingredient created with id ${newId}.`);

        return newId["LAST_INSERT_ROWID()"];
    }

    private getAll(): Ingredient[] {
        this.logger.debug("Getting all ingredients...");

        const getAllIngredients = this.database.prepare("SELECT * FROM ingredients");
        const allIngredients = getAllIngredients.all().map((dbIngredient) => ({
            id: dbIngredient.id,
            name: dbIngredient.name,
            quantity: {
                amount: dbIngredient.amount,
                unit: dbIngredient.unit
            }
        }));

        this.logger.debug(`Got ingredients: ${JSON.stringify(allIngredients)}`);

        return allIngredients;
    }
}
