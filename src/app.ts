import cookieParser from "cookie-parser"
import express from "express"

const HTTP_STATUS_OK = 200
const HTTP_STATUS_UNAUTHORIZED = 401
const LISTEN_PORT = 3000

const app = express()

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
    response.status(HTTP_STATUS_OK).send({ authorization: "197" })
  }
  else {
    response.status(HTTP_STATUS_UNAUTHORIZED).send("Nope. Try again.")
  }
})

app.listen(LISTEN_PORT, "localhost", () => { console.log("Listening!") })
