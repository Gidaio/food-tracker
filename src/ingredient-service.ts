import { Ingredient } from "./ingredient";
import { Service } from "./service";

import Database from "better-sqlite3";
import express from "express";
import { LoggerInstance } from "winston";

const unitTypes = ["tsp", "tbsp", "fl oz", "cup", "pt", "qt", "gal", "oz", "lbs"];

export class IngredientService extends Service {
    public constructor(database: Database, logger: LoggerInstance) {
        super(database, logger);

        const createTable = database.prepare(`
            CREATE TABLE IF NOT EXISTS ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                amount INTEGER,
                unit TEXT
            );`);

        createTable.run();
    }

    protected setRoutes(): express.Router {
        const router = express.Router();
        router.get("/", (request, response) => {
            this.logger.debug("GET request on ingredients.");

            const ingredients = this.getAllIngredients();

            this.logger.debug("Sending response.");

            response.setHeader("Content-Type", "application/json");
            response.status(200).send(
                JSON.stringify(
                    ingredients.map((ingredient) => ingredient.objectify())
                )
            );
        });

        router.post("/", (request, response) => {
            this.logger.debug(`POST request on ingredients with body ${JSON.stringify(request.body)}.`);

            const requestIngredient = this.validateIngredient(request.body);

            this.logger.debug("Body is valid.");

            const responseIngredient = this.insertIngredient(requestIngredient);

            this.logger.debug("Sending response.");

            response.setHeader("Content-Type", "application/json");
            response.status(200).send(responseIngredient.serialize());
        });

        return router;
    }

    private validateIngredient(body: any): Ingredient {
        if (!body.name) { throw new Error("Missing name on request."); }
        if (typeof body.name !== "string") { throw new Error("Name should be a string."); }

        if (!body.quantity) { throw new Error("Missing quantity on request."); }
        if (!body.quantity.amount) { throw new Error("Missing quantity amount on request."); }
        if (typeof body.quantity.amount !== "number") { throw new Error("Quantity amount should be a number."); }
        if (!body.quantity.unit) { throw new Error("Missing quantity unit on request."); }
        if (!unitTypes.includes(body.quantity.unit)) {
            throw new Error(`Quantity unit must be one of ${unitTypes.join(", ")}.`);
        }

        return new Ingredient(0, body.name, body.quantity);
    }

    private insertIngredient(ingredient: Ingredient): Ingredient {
        this.logger.debug(`Creating ingredient with name ${ingredient.name} and
            quantity ${ingredient.quantity.amount} ${ingredient.quantity.unit}...`);

        const createIngredient = this.database.prepare(`
            INSERT INTO ingredients (name, amount, unit) VALUES (?, ?, ?);`);
        createIngredient.run(ingredient.name, ingredient.quantity.amount, ingredient.quantity.unit);

        const getId = this.database.prepare("SELECT LAST_INSERT_ROWID();");
        const newId = getId.get()["LAST_INSERT_ROWID()"];

        this.logger.debug(`Ingredient created with id ${newId}.`);

        return new Ingredient(newId, ingredient.name, ingredient.quantity);
    }

    private getAllIngredients(): Ingredient[] {
        this.logger.debug("Getting all ingredients...");

        const getAllIngredients = this.database.prepare("SELECT * FROM ingredients");
        const allIngredients = getAllIngredients.all().map((dbIngredient) => new Ingredient(
            dbIngredient.id,
            dbIngredient.name,
            {
                amount: dbIngredient.amount,
                unit: dbIngredient.unit
            }
        ));

        this.logger.debug(`Got ingredients: ${JSON.stringify(allIngredients)}`);

        return allIngredients;
    }
}
