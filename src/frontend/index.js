async function getAllIngredients() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/ingredient", false);
    xhr.send();

    return JSON.parse(xhr.responseText);
}

function addIngredientToElement(container, ingredient) {
    const newRow = document.createElement("div");
    newRow.className = "row mt-3";
    const ingredientNameElement = document.createElement("h4");
    ingredientNameElement.innerText = ingredient.name;
    newRow.appendChild(ingredientNameElement);
    container.appendChild(newRow);
}

window.onload = () => {
    const container = document.querySelector("div.container");
    if (container === null) {
        throw new Error("Couldn't find the container!");
    }

    getAllIngredients().then((allIngredients) => {
        for (const ingredient of allIngredients) {
            addIngredientToElement(container, ingredient);
        }
    });
};
