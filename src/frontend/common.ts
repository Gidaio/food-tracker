type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";
type VolumeType = "tsp" | "tbsp" | "fl oz" | "cup" | "pt" | "qt" | "gal";
type WeightType = "oz" | "lbs";
type UnitType = VolumeType | WeightType;

interface ElementDescriptor {
    name: string;
    content?: Array<string | ElementDescriptor>;
    attributes?: { [key: string]: any };
}

interface Quantity {
    amount: number;
    type: UnitType;
}

interface Conversion {
    type: UnitType;
    factor: number;
}

interface ConversionLink {
    up?: Conversion;
    down?: Conversion;
}

type ConversionSet = {
    [K in UnitType]: ConversionLink
};

const conversions: ConversionSet = {
    // Volume conversions
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
    },

    // Weight conversions
    oz: {
        up: {
            type: "lbs",
            factor: 1 / 16
        }
    },
    lbs: {
        down: {
            type: "oz",
            factor: 16
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
            if (typeof attribute !== "symbol") {
                (element as any)[attribute] = attributes[attribute];
            }
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

function convertToSmallestUnit(quantity: Quantity): Quantity {
    let currentQuantity = quantity;

    while (conversions[currentQuantity.type].down) {
        const conversion = conversions[currentQuantity.type].down!;
        currentQuantity.amount *= conversion.factor;
        currentQuantity.type = conversion.type;
    }

    return currentQuantity;
}

function convertToLargestWholeUnit(quantity: Quantity): Quantity {
    let currentQuantity = { ...quantity };
    let previousQuantity = { ...currentQuantity };

    while (currentQuantity.amount > 1 && conversions[currentQuantity.type].up) {
        previousQuantity = { ...currentQuantity };
        const conversion = conversions[currentQuantity.type].up!;
        currentQuantity.amount *= conversion.factor;
        currentQuantity.type = conversion.type;
    }

    return previousQuantity
}

function formatQuantityAmount(amount: number): string {
    const amountString = amount.toFixed(2);

    let index = amountString.length - 1
    while (amountString[index] === "0" || amountString[index] === ".") {
        index--;
        if (amountString[index] === ".") {
            index--;
            break;
        }
    }

    return amountString.slice(0, index + 1)
}
