import Database from "better-sqlite3";
import express from "express";
import { Logger, transports } from "winston";

import { IngredientService } from "./ingredient-service";

class App {
    private app = express();
    private logger = new Logger({transports: [
        new transports.File({ filename: `${__dirname}/log`})
    ]});
    private database = new Database(`${__dirname}/database.db`);
    private ingredients = new IngredientService(this.database, this.logger);

    public main() {
        this.app.use("/api/ingredient", this.ingredients.routes);

        this.app.use(express.static(`${__dirname}/frontend`));

        this.app.listen(3000, () => {
            console.log("Listening on port 3000.");
        });
    }
}

new App().main();
