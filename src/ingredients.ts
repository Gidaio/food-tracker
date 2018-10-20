import { HttpResponse, isAuthorized } from "./app.js"

import express from "express"
import nedb from "nedb"

interface Ingredient {
  _id: string
  amount: number
  unit: string
}

export function setRoutes(app: express.Express, database: nedb): void {
  app.get("/ingredients", (request, response) => {
    console.log("Body", request.body)

    if (!isAuthorized(request, response)) {
      return
    }

    // TODO: Find/make a more precise error type.
    // tslint:disable-next-line:no-any
    database.find({}, (error: any, dbIngredients: Ingredient[]) => {
      if (error) {
        console.log(error)
        response.status(HttpResponse.InternalServerError).send({ error })
      }
      else {
        const parsedIngredients = dbIngredients.map((ingredient) => ({
          name: ingredient._id,
          amount: ingredient.amount,
          unit: ingredient.unit
        }))

        response.status(HttpResponse.Ok).send(parsedIngredients)
      }
    })
  })

  app.post("/ingredients/:ingredientName", (request, response) => {
    console.log("Body", request.body)

    if (!isAuthorized(request, response)) {
      return
    }

    const { amount, unit } = request.body
    if (!amount || !unit) {
      response.status(HttpResponse.BadRequest).send({ error: "Amount or unit missing." })

      return
    }

    const ingredient = { _id: request.params.ingredientName, amount, unit }

    database.insert(ingredient, (error, document) => {
      if (error) {
        console.log(error)
        response.status(HttpResponse.InternalServerError).send({ error })
      }
      else {
        response.status(HttpResponse.Created).send()
      }
    })
  })
}
