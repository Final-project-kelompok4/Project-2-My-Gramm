const express = require("express")
const app = express()

require("dotenv").config()

const router = require("./routes/userRoutes")



app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.use(router)

module.exports = app