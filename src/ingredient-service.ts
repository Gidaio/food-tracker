import { Ingredient, IngredientProperties } from "./ingredient";
import { Service } from "./service";

export class IngredientService extends Service {
    protected createTables(): void {
        this.database.exec(
            `CREATE TABLE IF NOT EXISTS ingredients (
                name TEXT PRIMARY KEY,
                amount REAL,
                unit TEXT
            );`
        );
    }

    protected setRoutes(): void {
        this.routes.get("/", this.endpoint(() => ({}), this.getAllIngredients.bind(this)));
        this.routes.post("/", this.endpoint(
            Ingredient.validate,
            this.createIngredient.bind(this))
        );
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
