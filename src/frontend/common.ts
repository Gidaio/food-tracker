class ElementFactory {
    private constructor(private baseElement: HTMLElement) { }

    public static create(name: string, className: string = "", id: string = ""): ElementFactory {
        const newElement = document.createElement(name);
        newElement.className = className;
        newElement.id = id;

        return new ElementFactory(newElement);
    }

    public build(): HTMLElement {
        return this.baseElement;
    }

    public addChild(name: string, className?: string, text?: string, id?: string): ElementFactory;

    public addChild(childElement: ElementFactory): ElementFactory;

    public addChild(
        element: string | ElementFactory,
        className: string = "",
        text: string = "",
        id: string = ""
    ): ElementFactory {
        if (typeof element === "string") {
            const newElement = document.createElement(element);
            if (className !== "") {
                newElement.className = className;
            }
            if (id !== "") {
                newElement.id = id;
            }
            if (text !== "") {
                newElement.textContent = text;
            }

            this.baseElement.appendChild(newElement);
        }
        else if (element instanceof ElementFactory) {
            this.baseElement.appendChild(element.build());
        }
        else {
            throw new Error("'element' isn't a string or ElementFactory!");
        }

        return this;
    }
}

function safeElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Couldn't find element with id ${id}.`);
    }
    return element as T;
}

function safeQuerySelector<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector(selector);
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
