type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

interface Ingredient {
    id: number;
    name: string;
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
    const newRow = document.createElement("div");
    newRow.className = "row mt-3";
    const ingredientNameElement = document.createElement("h4");
    ingredientNameElement.innerText = ingredient.name;
    newRow.appendChild(ingredientNameElement);
    container.appendChild(newRow);
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
        for (const ingredient of allIngredients) {
            addIngredientToElement(container, ingredient);
        }
    });
};
