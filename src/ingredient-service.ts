import Database = require("better-sqlite3");

interface Ingredient {
    id: number;
    name: string;
}

export class IngredientService {
    private database: Database;

    public constructor(database: Database) {
        this.database = database;

        const createTable = database.prepare(`
            CREATE TABLE IF NOT EXISTS ingredients(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT
            );`);

        console.log("Create table returns data:", createTable.returnsData);

        createTable.run();
    }
}
