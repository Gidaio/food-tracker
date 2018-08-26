import cookieParser from "cookie-parser"
import express from "express"

const HTTP_STATUS_OK = 200
const HTTP_STATUS_UNAUTHORIZED = 401
const LISTEN_PORT = 3000

const app = express()

app.use(cookieParser())
app.use(express.json())

app.post("/login", (request: express.Request, response: express.Response) => {
  if (request.cookies.session) {
    response.status(HTTP_STATUS_OK).send(`You're already signed in! Here's your number: ${request.cookies.session}`)
  }
  else {
    const { username, password } = request.body
    if (username === "tanis" && password === "pa$$w0rd") {
      response.setHeader("set-cookie", "session=197")
      response.status(HTTP_STATUS_OK).send("Sending you a cookie!")
    }
    else {
      response.status(HTTP_STATUS_UNAUTHORIZED).send("Nope. Try again.")
    }
  }
})

app.listen(LISTEN_PORT, "localhost", () => { console.log("Listening!") })
