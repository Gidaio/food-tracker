import { HTTPError } from "./errors";
import { Service } from "./service";

interface Recipe {
    name: string;
    instructions: string;
    ingredients: IngredientUsage[];
}

interface IngredientUsage {
    name: string;
    amount: number;
}

export class RecipeService extends Service {
    protected createTables(): void {
        this.logger.debug("Creating tables for recipes...");

        this.database.exec(`
            CREATE TABLE IF NOT EXISTS recipes (
                name TEXT PRIMARY KEY,
                instructions TEXT
            );`
        );

        this.database.exec(`
            CREATE TABLE IF NOT EXISTS recipe_ingredients (
                recipe_name TEXT REFERENCES recipes (name),
                ingredient_name TEXT REFERENCES ingredients (name),
                amount REAL,
                PRIMARY KEY (recipe_name, ingredient_name)
            );`
        );
    }

    protected setRoutes(): void {
        this.logger.debug("Building routes for recipes...");

        this.routes.get("/", this.endpoint(() => true, this.listRecipeNames.bind(this)));

        this.routes.post("/", this.endpoint(
            this.validateCreate.bind(this),
            this.createRecipe.bind(this)
        ));
    }

    private validateCreate(body: any): Recipe {
        this.logger.debug("Validating recipe...");

        const unitTypes = ["tsp", "tbsp", "fl oz", "cup", "pt", "qt", "gal", "oz", "lbs"];

        if (!body.name) { throw new HTTPError(400, "No recipe name specified."); }
        if (typeof body.name !== "string") {
            throw new HTTPError(400, "Recipe name must be a string.");
        }

        if (!body.instructions) { throw new HTTPError(400, "No recipe instructions specified."); }
        if (typeof body.instructions !== "string") {
            throw new HTTPError(400, "Recipe instructions must be a string.");
        }

        if (!body.ingredients) { throw new HTTPError(400, "No recipe ingredients specified."); }
        if (Array.isArray(body.ingredients)) {
            throw new HTTPError(400, "Recipe ingredients must be an array.");
        }

        this.logger.debug("Validating ingredients on recipe...");

        const ingredients = (body.ingredients as any[]).map((ingredient, index) => {
            if (!ingredient.name) {
                throw new HTTPError(400, `Ingredient ${index}: Missing name.`);
            }
            if (typeof ingredient.name !== "string") {
                throw new HTTPError(400, `Ingredient ${index}: Name should be a string.`);
            }

            if (!ingredient.amount) {
                throw new HTTPError(400, `Ingredient ${index}: Missing amount.`);
            }
            if (typeof ingredient.amount !== "number") {
                throw new HTTPError(400, `Ingredient ${index}: Amount should be a number.`);
            }

            return {
                name: ingredient.name,
                amount: ingredient.amount
            };
        });

        return {
            name: body.name,
            instructions: body.instructions,
            ingredients
        };
    }

    private createRecipe(recipe: Recipe) {
        this.logger.debug(`Creating a recipe with name ${recipe.name}...`);

        const createRecipe = this.database.prepare(
            "INSERT INTO recipes (name, instructions) VALUES (?, ?);"
        );
        createRecipe.run(recipe.name, recipe.instructions);

        this.logger.debug("Creating ingredient linkages...");

        for (const ingredient of recipe.ingredients) {
            const createIngredientLink = this.database.prepare(
                `INSERT INTO recipe_ingredients (
                    recipe_name, ingredient_name, amount
                ) VALUES (?, ?, ?);`
            );

            createIngredientLink.run(recipe.name, ingredient.name, ingredient.amount);
        }

        return {
            name: recipe.name,
            instructions: recipe.instructions,
            ingredients: recipe.ingredients
        };
    }

    private listRecipeNames() {
        this.logger.debug("Listing all recipe names...");

        const listRecipeNamesQuery = this.database.prepare("SELECT * FROM recipes");
        const recipeNames = listRecipeNamesQuery.all().map((dbRecipe) => ({
            name: dbRecipe.name
        }));

        return recipeNames;
    }
}
