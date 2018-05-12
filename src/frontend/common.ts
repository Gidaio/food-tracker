type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

interface ElementDescriptor {
    name: string;
    content?: Array<string | ElementDescriptor>;
    attributes?: { [key: string]: any };
}

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
