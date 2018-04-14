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

async function JsonRequest<T>(method: HTTPMethod, url: string, data?: object | undefined): Promise<T> {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, false);

    xhr.send(JSON.stringify(data));

    if (xhr.status >= 200 && xhr.status < 400) {
        return JSON.parse(xhr.responseText) as T;
    }
    else {
        throw new Error(`${xhr.status}: ${xhr.responseText}`);
    }
}

async function createIngredient(): Promise<Ingredient> {
    const ingredientName = safeElementById<HTMLInputElement>("ingredient-name").value;

    return await JsonRequest<Ingredient>("POST", "/api/ingredient", { name: ingredientName });
}

async function getAllIngredients() {
    return await JsonRequest<Ingredient[]>("GET", "/api/ingredient");
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
    const container = document.querySelector("div.container") as HTMLDivElement | null;
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
