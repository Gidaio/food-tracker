// tslint:disable:no-reference
/// <reference path="./common.ts" />
// tslint:enable:no-reference

interface IngredientResponse {
    id: number;
    name: string;
    quantity: number;
}

interface Ingredient {
    id: number;
    name: string;
    quantities: string[];
}

function parseIngredientResponse(response: IngredientResponse): Ingredient {
    const responseQuantities = convertUp(response.quantity, "tsp");

    return {
        id: response.id,
        name: response.name,
        quantities: responseQuantities.map((item) => `${item.quantity} ${item.type}`)
    };
}

async function createIngredient() {
    const name = safeElementById<HTMLInputElement>("ingredient-name").value;
    const quantity = Number(safeElementById<HTMLInputElement>("ingredient-quantity").value);
    const quantityType = safeElementById<HTMLSelectElement>("ingredient-quantity-type").value;

    const teaspoons = convertDownToTsp(quantity, quantityType as VolumeType);

    return await JSONRequest<IngredientResponse>("POST", "/api/ingredient", { name, quantity: teaspoons });
}

async function getAllIngredients() {
    const ingredientResponses = await JSONRequest<IngredientResponse[]>("GET", "/api/ingredient");
    const ingredients: Ingredient[] = [];

    for (const response of ingredientResponses) {
        ingredients.push(parseIngredientResponse(response));
    }

    return ingredients;
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
                        ingredient.quantities.join(", ")
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

window.onload = () => {
    const ingredientsList = safeElementById<HTMLDivElement>("ingredients-list");

    const ingredientForm = safeElementById<HTMLFormElement>("ingredient-form");
    ingredientForm.onsubmit = () => {
        createIngredient().then((newIngredient) => {
            const parsedIngredient = parseIngredientResponse(newIngredient);
            addIngredientToElement(ingredientsList, parsedIngredient);
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
