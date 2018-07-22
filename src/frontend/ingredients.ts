// tslint:disable:no-reference
/// <reference path="./common.ts" />
// tslint:enable:no-reference

interface Ingredient {
    id: number;
    name: string;
    quantity: Quantity;
}

window.onload = () => {
    const ingredientsList = safeElementById<HTMLDivElement>("ingredients-list");

    const ingredientForm = safeElementById<HTMLFormElement>("ingredient-form");
    ingredientForm.onsubmit = () => {
        createIngredient().then((newIngredient) => {
            newIngredient.quantity = convertToLargestWholeUnit(newIngredient.quantity);
            addIngredientToElement(ingredientsList, newIngredient);
            ingredientForm.reset();
        });
        return false;
    };

    getAllIngredients().then((allIngredients) => {
        for (const ingredient of allIngredients) {
            addIngredientToElement(ingredientsList, ingredient);
        }
    });
};

async function getAllIngredients() {
    const response = await JSONRequest<Ingredient[]>("GET", "/api/ingredients");

    return response.map((ingredient) => {
        ingredient.quantity = convertToLargestWholeUnit(ingredient.quantity);
        return ingredient;
    });
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
                attributes: { className: "card-body d-none" },
                content: [{
                    name: "p",
                    content: [{
                        name: "strong",
                        content: ["Quantity: "]
                    },
                        `${ingredient.quantity.amount} ${ingredient.quantity.unit}`
                    ]
                }]
            }]
        }]
    });

    const header = safeQuerySelector("div.card-header", child);
    const caret = safeQuerySelector("i", child);
    const body = safeQuerySelector("div.card-body", child);

    header.onclick = (event) => {
        event.stopPropagation();
        if (body.classList.contains("d-none")) {
            body.classList.remove("d-none");
            caret.className = "fas fa-caret-up float-right mt-1";
        }
        else {
            body.classList.add("d-none");
            caret.className = "fas fa-caret-down float-right mt-1";
        }
    };

    container.appendChild(child);
}

async function createIngredient() {
    const name = safeElementById<HTMLInputElement>("ingredient-name").value;

    const quantity: Quantity = {
        amount: Number(safeElementById<HTMLInputElement>("ingredient-quantity").value),
        unit: safeElementById<HTMLSelectElement>("ingredient-quantity-type").value as UnitType
    };

    const smallQuantity = convertToSmallestUnit(quantity);

    return await JSONRequest<Ingredient>("POST", "/api/ingredients", { name, quantity: smallQuantity });
}
