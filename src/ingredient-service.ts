import { HTTPError } from "./errors";
import { Ingredient, IngredientProperties } from "./ingredient";
import { Service } from "./service";

const unitTypes = ["tsp", "tbsp", "fl oz", "cup", "pt", "qt", "gal", "oz", "lbs"];

export class IngredientService extends Service {
    protected createTables(): void {
        const createTable = this.database.prepare(
            `CREATE TABLE IF NOT EXISTS ingredients (
                name TEXT PRIMARY KEY,
                amount INTEGER,
                unit TEXT
            );`
        );

        createTable.run();
    }

    protected setRoutes(): void {
        this.routes.get("/", this.endpoint(() => ({}), this.getAllIngredients.bind(this)));
        this.routes.post("/", this.endpoint(
            this.validateIngredient,
            this.createIngredient.bind(this))
        );
    }

    private validateIngredient(body: any): Ingredient {
        if (!body.name) { throw new HTTPError(400, "Missing name on request."); }
        if (typeof body.name !== "string") { throw new HTTPError(400, "Name should be a string."); }

        if (!body.quantity) { throw new HTTPError(400, "Missing quantity on request."); }
        if (!body.quantity.amount) {
            throw new HTTPError(400, "Missing quantity amount on request.");
        }
        if (typeof body.quantity.amount !== "number") {
            throw new HTTPError(400, "Quantity amount should be a number.");
        }
        if (!body.quantity.unit) { throw new HTTPError(400, "Missing quantity unit on request."); }
        if (!unitTypes.includes(body.quantity.unit)) {
            throw new HTTPError(400, `Quantity unit must be one of ${unitTypes.join(", ")}.`);
        }

        return new Ingredient(body.name, body.quantity);
    }

    private createIngredient(ingredient: Ingredient): IngredientProperties {
        this.logger.debug(`Creating ingredient with name ${ingredient.name} and
            quantity ${ingredient.quantity.amount} ${ingredient.quantity.unit}...`);

        const createIngredient = this.database.prepare(
            `INSERT INTO ingredients (name, amount, unit) VALUES (?, ?, ?);`
        );
        createIngredient.run(ingredient.name, ingredient.quantity.amount, ingredient.quantity.unit);

        return ingredient.objectify();
    }

    private getAllIngredients(): IngredientProperties[] {
        this.logger.debug("Getting all ingredients...");

        const getIngredientsQuery = this.database.prepare("SELECT * FROM ingredients");
        const allIngredients = getIngredientsQuery.all().map((dbIngredient) => new Ingredient(
            dbIngredient.name,
            dbIngredient.amount,
            dbIngredient.unit
        ));

        this.logger.debug(`Got ingredients: ${JSON.stringify(allIngredients)}`);

        return allIngredients.map((ingredient) => ingredient.objectify());
    }
}
