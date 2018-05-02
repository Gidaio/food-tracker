// tslint:disable:no-reference
/// <reference path="./common.ts" />
// tslint:enable:no-reference

type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

interface Ingredient {
    id: number;
    name: string;
    quantity: number;
    quantityType: string;
}

async function createIngredient(): Promise<Ingredient> {
    const ingredientName = safeElementById<HTMLInputElement>("ingredient-name").value;

    return await JSONRequest<Ingredient>("POST", "/api/ingredient", { name: ingredientName });
}

async function getAllIngredients() {
    return await JSONRequest<Ingredient[]>("GET", "/api/ingredient");
}

function addIngredientToElement(container: HTMLElement, ingredient: Ingredient) {
    // const column = document.createElement("div");
    // column.className = "col-12 col-sm-6 col-md-4 mb-4";

    // const card = document.createElement("div");
    // card.className = "card";

    // const cardBody = document.createElement("div");
    // cardBody.className = "card-body";

    // const ingredientName = document.createElement("h4");
    // ingredientName.textContent = ingredient.name;

    // const ingredientDetails = document.createElement("div");
    // ingredientDetails.style.display = "none";

    const child = ElementFactory.create("div", "col-12 col-sm-6 col-md-4 mb-4")
        .addChild(ElementFactory.create("div", "card")
            .addChild(ElementFactory.create("div", "card-body")
                .addChild("h4", "", ingredient.name)
            )
        )
    .build();

    container.appendChild(child);
}

window.onload = () => {
    const ingredientsList = safeElementById<HTMLDivElement>("ingredients-list");

    const ingredientForm = safeElementById<HTMLFormElement>("ingredient-form");
    ingredientForm.onsubmit = () => {
        createIngredient().then((newIngredient) => {
            addIngredientToElement(ingredientsList, newIngredient);
        });
        return false;
    };

    getAllIngredients().then((allIngredients) => {
        for (const ingredient of allIngredients) {
            addIngredientToElement(ingredientsList, ingredient);
        }
    });
};
