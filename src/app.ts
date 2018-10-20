import { setRoutes } from "./ingredients.js"

import cookieParser from "cookie-parser"
import express from "express"
import nedb from "nedb"

export enum HttpResponse {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  InternalServerError = 500
}

const LISTEN_PORT = 3000

const app = express()
const database = new nedb({ filename: "database.nedb", autoload: true })

app.use(cookieParser())
app.use(express.json())

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  next()
})

app.post("/login", (request: express.Request, response: express.Response) => {
  console.log("Body", request.body)

  const { username, password } = request.body
  if (username === "tanis" && password === "pa$$w0rd") {
    response.status(HttpResponse.Ok).send({ authorization: "197" })
  }
  else {
    response.status(HttpResponse.Unauthorized).send({ error: "Nope. Try again." })
  }
})

setRoutes(app, database)

app.listen(LISTEN_PORT, "localhost", () => { console.log("Listening!") })

export function isAuthorized(request: express.Request, response: express.Response): boolean {
  const { authorization } = request.headers
  if (!authorization || authorization !== "197") {
    response.status(HttpResponse.Unauthorized).send()

    return false
  }

  return true
}
