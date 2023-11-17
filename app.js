const express = require("express")
const app = express()

require("dotenv").config()

const router = require("./routes/userRoutes")
const port = process.env.PORT

app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.use(router)

app.listen(port, () => {
    console.log("server running on poort : ", port);
}) 