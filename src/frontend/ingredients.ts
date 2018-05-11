// tslint:disable:no-reference
/// <reference path="./common.ts" />
/// <reference types="jquery" />
// tslint:enable:no-reference

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
    const child = createElements({
        name: "div",
        attributes: { className: "col-12 col-sm-6 col-md-4 mb-4" },
        content: [{
            name: "div",
            attributes: { className: "card" },
            content: [{
                name: "div",
                attributes: { className: "card-header" },
                content: [{
                    name: "h4",
                    attributes: { className: "card-title d-inline-block" },
                    content: [ingredient.name]
                }, {
                    name: "i",
                    attributes: { className: "fas fa-caret-down float-right mt-1" }
                }]
            }, {
                name: "div",
                attributes: { className: "card-body slide-hidden" },
                content: [{
                    name: "p",
                    content: [
                        `Lorem ipsum blah blah blah other stuff. Let's make this decently long so it
                        does a little wrapping and stuff.`
                    ]
                }]
            }]
        }]
    });

    safeQuerySelector("div.card-header", child).onclick = (event) => {
        event.stopPropagation();
        safeQuerySelector("div.card-body", child).className = "card-body slide-shown";
    };

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
