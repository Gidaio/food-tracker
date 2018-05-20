type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";
type VolumeType = "tsp" | "tbsp" | "fl oz" | "cup" | "pt" | "qt" | "gal";

interface ElementDescriptor {
    name: string;
    content?: Array<string | ElementDescriptor>;
    attributes?: { [key: string]: any };
}

interface Quantity {
    quantity: number;
    type: VolumeType;
}

interface Conversion {
    type: VolumeType;
    factor: number;
}

interface ConversionLink {
    up?: Conversion;
    down?: Conversion;
}

type ConversionSet = {
    [K in VolumeType]: ConversionLink
};

const conversions: ConversionSet = {
    tsp: {
        up: {
            type: "tbsp",
            factor: (1 / 3)
        }
    },
    tbsp: {
        down: {
            type: "tsp",
            factor: 3
        },
        up: {
            type: "fl oz",
            factor: 0.5
        }
    },
    "fl oz": {
        down: {
            type: "tbsp",
            factor: 2
        },
        up: {
            type: "cup",
            factor: 0.125
        }
    },
    cup: {
        down: {
            type: "fl oz",
            factor: 8
        },
        up: {
            type: "pt",
            factor: 0.5
        }
    },
    pt: {
        down: {
            type: "cup",
            factor: 2
        },
        up: {
            type: "qt",
            factor: 0.5
        }
    },
    qt: {
        down: {
            type: "pt",
            factor: 2
        },
        up: {
            type: "gal",
            factor: 0.25
        }
    },
    gal: {
        down: {
            type: "qt",
            factor: 4
        }
    }
};

// Adapted from
// https://stackoverflow.com/questions/2946656/advantages-of-createelement-over-innerhtml

function createElements(descriptor: ElementDescriptor) {
    const element = document.createElement(descriptor.name);

    const attributes = descriptor.attributes;

    if (attributes) {
        Reflect.ownKeys(attributes).forEach((attribute) => {
            (element as any)[attribute] = attributes[attribute];
        });
    }

    if (descriptor.content) {
        for (const parameter of descriptor.content) {
            if (typeof parameter === "string") {
                element.appendChild(document.createTextNode(parameter));
            }
            else {
                element.appendChild(createElements(parameter));
            }
        }
    }

    return element;
}

function safeElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Couldn't find element with id ${id}.`);
    }
    return element as T;
}

function safeQuerySelector<T extends HTMLElement>(selector: string, context: HTMLElement | Document = document): T {
    const element = context.querySelector(selector);
    if (element === null) {
        throw new Error(`No elements matched the selector ${selector}.`);
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

function convertDownToTsp(quantity: number, type: VolumeType): number {
    let currentQuantity = quantity;
    let currentType = type;

    while (currentType !== "tsp") {
        const conversion = conversions[currentType].down;
        if (!conversion) {
            throw new Error(`Couldn't find down-conversion for ${currentType}.`);
        }
        currentQuantity *= conversion.factor;
        currentType = conversion.type;
    }

    return currentQuantity;
}

function convertUp(quantity: number, type: VolumeType): Quantity[] {
    const outQuantities: Quantity[] = [];

    let currentQuantity = quantity;
    let currentType = type;

    let previousQuantity: number;
    let previousType: VolumeType;

    // Convert up from teaspoons until we have a value less than one.
    while (currentQuantity >= 1 && currentType !== "gal") {
        previousQuantity = currentQuantity;
        previousType = currentType;
        const conversion = conversions[currentType].up;
        if (!conversion) {
            throw new Error(`Couldn't find up-conversion for ${currentType}.`);
        }
        currentQuantity *= conversion.factor;
        currentType = conversion.type;
    }

    // If we overshot, back up a bit.
    if (currentQuantity < 1) {
        currentQuantity = previousQuantity!;
        currentType = previousType!;
    }

    // Add it to the output.
    outQuantities.push({ quantity: currentQuantity, type: currentType });

    // Then pull off the part we just output.
    currentQuantity -= Math.trunc(currentQuantity);

    // Then, convert down to teaspoons until we get an even number.
    while (currentQuantity !== 0 && currentType !== "tsp") {
        const conversion = conversions[currentType].down;
        if (!conversion) {
            throw new Error(`Couldn't find down-conversion for ${currentType}.`);
        }
        currentQuantity *= conversion.factor;
        currentType = conversion.type;
        if (currentQuantity >= 1) {
            outQuantities.push({ quantity: currentQuantity, type: currentType });
            currentQuantity -= Math.trunc(currentQuantity);
        }
    }

    // If we still have some left, they're teaspoons.
    if (currentQuantity > 0) {
        outQuantities.push({ quantity: currentQuantity, type: "tsp" });
    }

    return outQuantities;
}
