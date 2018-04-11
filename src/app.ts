import express = require("express");

class App {
    private app = express();

    private static addApiRoutes(app: express.Express) {
        app.post("/api/ingredient", (request, response) => {
            response.status(200).send("{\"message\": \"Success!\"");
        });
    }

    public main() {
        App.addApiRoutes(this.app);

        this.app.use(express.static(`${__dirname}/frontend`));

        this.app.listen(3000, () => {
            console.log("Listening on port 3000.");
        });
    }
}

new App().main();
