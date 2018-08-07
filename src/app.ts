import Database from "better-sqlite3";
import express from "express";
import { Logger, transports } from "winston";

import { IngredientService } from "./ingredient-service";
import { RecipeService } from "./recipe-service";

class App {
    private app = express();
    private logger = new Logger({
        level: "debug",
        transports: [
            new transports.File({ filename: `${__dirname}/out.log`})
        ]
    });
    private database = new Database(`${__dirname}/database.db`);
    private ingredients = new IngredientService(this.database, this.logger);
    private recipes = new RecipeService(this.database, this.logger);

    public main() {
        this.app.use(express.static(`${__dirname}/frontend`));

        this.app.use(express.json());

        this.app.use("/api/ingredients", this.ingredients.routes);
        this.app.use("/api/recipes", this.recipes.routes);

        this.app.listen(3000, () => {
            console.log("Listening on port 3000.");
        });
    }
}

new App().main();
