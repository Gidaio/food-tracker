import cookieParser from "cookie-parser"
import express from "express"
import nedb from "nedb"

interface Ingredient {
  _id: string
  amount: number
  unit: string
}

const HTTP_OK = 200
const HTTP_CREATED = 201
const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_INTERNAL_SERVER_ERROR = 500
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
    response.status(HTTP_OK).send({ authorization: "197" })
  }
  else {
    response.status(HTTP_UNAUTHORIZED).send("Nope. Try again.")
  }
})

app.get("/ingredients", (request, response) => {
  console.log("Body", request.body)

  if (!isAuthorized(request, response)) { return }

  // TODO: Find/make a more precise error type.
  // tslint:disable-next-line:no-any
  database.find({}, (error: any, dbIngredients: Ingredient[]) => {
    if (error) {
      console.log(error)
      response.status(HTTP_INTERNAL_SERVER_ERROR).send({ error })
    }
    else {
      const parsedIngredients = dbIngredients.map((ingredient) => ({
        name: ingredient._id,
        amount: ingredient.amount,
        unit: ingredient.unit
      }))

      response.status(HTTP_OK).send(parsedIngredients)
    }
  })
})

app.post("/ingredients/:ingredientName", (request, response) => {
  console.log("Body", request.body)

  if (!isAuthorized(request, response)) { return }

  const { amount, unit } = request.body
  if (!amount || !unit) {
    response.status(HTTP_BAD_REQUEST).send({ error: "Amount or unit missing." })
  }

  const ingredient = { _id: request.params.ingredientName, amount, unit }

  database.insert(ingredient, (error, document) => {
    if (error) {
      console.log(error)
      response.status(HTTP_INTERNAL_SERVER_ERROR).send({ error })
    }
    else {
      response.status(HTTP_CREATED).send()
    }
  })
})

app.listen(LISTEN_PORT, "localhost", () => { console.log("Listening!") })

function isAuthorized(request: express.Request, response: express.Response): boolean {
  const { authorization } = request.headers
  if (!authorization || authorization !== "197") {
    response.status(HTTP_UNAUTHORIZED).send()

    return false
  }

  return true
}
