type VolumeType = "tsp" | "tbsp" | "fl oz" | "cup" | "pt" | "qt" | "gal";
type WeightType = "oz" | "lbs";
type UnitType = VolumeType | WeightType;

interface IngredientProperties {
    id: number;
    name: string;
    quantity: Quantity;
}

interface Quantity {
    amount: number;
    unit: UnitType;
}

interface Conversion {
    unit: UnitType;
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
            unit: "tbsp",
            factor: (1 / 3)
        }
    },
    tbsp: {
        down: {
            unit: "tsp",
            factor: 3
        },
        up: {
            unit: "fl oz",
            factor: 0.5
        }
    },
    "fl oz": {
        down: {
            unit: "tbsp",
            factor: 2
        },
        up: {
            unit: "cup",
            factor: 0.125
        }
    },
    cup: {
        down: {
            unit: "fl oz",
            factor: 8
        },
        up: {
            unit: "pt",
            factor: 0.5
        }
    },
    pt: {
        down: {
            unit: "cup",
            factor: 2
        },
        up: {
            unit: "qt",
            factor: 0.5
        }
    },
    qt: {
        down: {
            unit: "pt",
            factor: 2
        },
        up: {
            unit: "gal",
            factor: 0.25
        }
    },
    gal: {
        down: {
            unit: "qt",
            factor: 4
        }
    },

    // Weight conversions
    oz: {
        up: {
            unit: "lbs",
            factor: 1 / 16
        }
    },
    lbs: {
        down: {
            unit: "oz",
            factor: 16
        }
    }
};

export class Ingredient {
    public id: number;
    public name: string;
    public quantity: Quantity;

    public constructor(id: number, name: string, quantity: Quantity) {
        this.id = id;
        this.name = name;
        this.quantity = this.convertToSmallestUnit(quantity);
    }

    public serialize(): string {
        return JSON.stringify(this.objectify());
    }

    public objectify(): IngredientProperties {
        return {
            id: this.id,
            name: this.name,
            quantity: this.convertToLargestWholeUnit(this.quantity)
        };
    }

    private convertToSmallestUnit(quantity: Quantity): Quantity {
        const currentQuantity = quantity;

        while (conversions[currentQuantity.unit].down) {
            const conversion = conversions[currentQuantity.unit].down!;
            currentQuantity.amount *= conversion.factor;
            currentQuantity.unit = conversion.unit;
        }

        return currentQuantity;
    }

    private convertToLargestWholeUnit(quantity: Quantity): Quantity {
        if (!conversions[quantity.unit].up) {
            return quantity;
        }

        const conversion = conversions[quantity.unit].up!;
        const convertedQuantity: Quantity = {
            amount: quantity.amount * conversion.factor,
            unit: conversion.unit
        };

        if (convertedQuantity.amount > 1) {
            return this.convertToLargestWholeUnit(convertedQuantity);
        }
        else {
            return quantity;
        }
    }
}
