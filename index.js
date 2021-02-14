const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const { readFile } = require("fs")
const app = express()

app.use(morgan("dev"))
app.use(helmet())

let data
(() => {
    readFile("./data.json", "utf-8", (err, content) => {
        data = JSON.parse(content)
    })
})()

app.get("/", (req, res) => {
    res.json(data)
})

const port = process.env.port || 3000
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
})