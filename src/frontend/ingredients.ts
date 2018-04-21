type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

interface Ingredient {
    id: number;
    name: string;
}

class ElementFactory {
    private constructor(private baseElement: HTMLElement) { }

    public static create(name: string, className: string = "", id: string = ""): ElementFactory {
        const newElement = document.createElement(name);
        newElement.className = className;
        newElement.id = id;

        return new ElementFactory(newElement);
    }

    public build(): HTMLElement {
        return this.baseElement;
    }

    public addChild(name: string, className?: string, id?: string): ElementFactory;

    public addChild(childElement: ElementFactory): ElementFactory;

    public addChild(element: string | ElementFactory, className: string = "", id: string = ""): ElementFactory {
        if (typeof element === "string") {
            const newElement = document.createElement(element);
            newElement.className = className;
            newElement.id = id;

            this.baseElement.appendChild(newElement);
        }
        else if (element instanceof ElementFactory) {
            this.baseElement.appendChild(element.build());
        }
        else {
            throw new Error("'element' isn't a string or ElementFactory!");
        }

        return this;
    }
}

function safeElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Couldn't find element with id ${id}.`);
    }
    return element as T;
}

function JSONRequest<T>(method: HTTPMethod, url: string, data?: object | undefined): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("content-type", "application/json");

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                resolve(JSON.parse(xhr.responseText) as T);
            }
            else {
                reject(new Error(`${xhr.status}: ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Summat broke."));
        };

        xhr.send(JSON.stringify(data));
    });
}

async function createIngredient(): Promise<Ingredient> {
    const ingredientName = safeElementById<HTMLInputElement>("ingredient-name").value;

    return await JSONRequest<Ingredient>("POST", "/api/ingredient", { name: ingredientName });
}

async function getAllIngredients() {
    return await JSONRequest<Ingredient[]>("GET", "/api/ingredient");
}

function addIngredientToElement(container: HTMLElement, ingredient: Ingredient) {
    const column = document.createElement("div");
    column.className = "col-12 col-sm-6 col-md-4";
    const card = document.createElement("div");
    card.className = "card";
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const ingredientNameElement = document.createElement("h4");
    ingredientNameElement.innerText = ingredient.name;

    cardBody.appendChild(ingredientNameElement);
    card.appendChild(cardBody);
    column.appendChild(card);
    container.appendChild(column);
}

window.onload = () => {
    const container = document.querySelector("main.container") as HTMLDivElement | null;
    if (container === null) {
        throw new Error("Couldn't find the container!");
    }

    const ingredientForm = safeElementById<HTMLFormElement>("ingredient-form");
    ingredientForm.onsubmit = () => {
        createIngredient().then((newIngredient) => {
            addIngredientToElement(container, newIngredient);
        });
        return false;
    };

    getAllIngredients().then((allIngredients) => {
        let ingredientsProcessed = 0;
        let currentRow: HTMLDivElement | undefined;
        for (const ingredient of allIngredients) {
            if (ingredientsProcessed % 3 === 0) {
                currentRow = document.createElement("div");
                currentRow.className = "row";
                container.appendChild(currentRow);
            }

            if (!currentRow) {
                throw new Error("Somehow, there's no row to add to...");
            }

            addIngredientToElement(currentRow, ingredient);

            ingredientsProcessed++;
        }
    });
};
