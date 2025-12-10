import express, { Request, Response } from "express"
import articleRoutes from "./routes/r_articles"
import accountRoutes from "./routes/r_accounts"

const PORT = 8005
const app = express()

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.status(200).send({ message: "hello world" })
})

// Routes
app.use("/api/articles", articleRoutes)
app.use("/api/accounts", accountRoutes)

app.listen(PORT, () => {
    console.log("application run on port", PORT)
})
