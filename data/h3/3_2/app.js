const express = require("express")
const session = require("express-session")
const expressSanitizer = require("express-sanitizer")
const app = express()

const PORT = 3000
app.use(session({
    secret: "password1234",
    resave: false,
    saveUninitialized: true,

}))

app.use(express.urlencoded())
app.use(expressSanitizer())

app.use((req, res, next) => {
    if (req.session.currentColor == undefined) {
        req.session.currentColor = "#408080"
    }
    if (req.session.previousColor == undefined) {
        console.log("Resetting back to default color ")
        req.session.previousColor = "#408080"
    }

    if (req.body.newColor != undefined) {

        req.session.previousColor = req.session.currentColor
        req.session.currentColor = req.body.newColor

    }

    next()
})


app.get("/setBgColor", (req, res) => {

    console.log("/setBgColor session  = ", req.session)

    res.setHeader("Content-Type", "text/html")
    let myForm = `
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Set the color</title>
    </head>
    <body style="background-color: ${req.session.currentColor}">
    <form action="/viewBgColor" method="POST">
    <input type="color" id="newColor" name="newColor">
    <button type="submit">Submit</button>
    </form>
    </html>`;
    res.end(myForm)
})

app.post("/viewBgColor", (req, res) => {
    console.log("/viewBgColor session = ", req.session)
    let form = `<!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <title>Set the color</title>
        </head>
        <body style="background-color: ${req.session.currentColor}">
        <form action="/viewBgColor" method="POST">
        <input type="color" id="newColor" name="newColor" >
        <button type="submit">Submit</button>
        </form>
        </html>`

    res.write(form)
    res.write(`<form action="/viewBgColor" method="POST">
    <input type="hidden" id="newColor" name="newColor" value=${req.session.previousColor}>
    <button type="submit">Go back to previous color</button>
    </form>`)

    res.write(`<form action="/clearSession" method="POST">
    <button type="submit">Clear session data</button>
    </form>`)

    res.end()
})


app.post("/clearSession", (req, res) => {

    req.session.currentColor = "undefined"
    req.session.previousColor = "undefined"

    color = req.session.currentColor
    req.session.destroy((err) => {
        if (err) {
            res.statusCode = 500
            res.end();
        }
    })

    res.end(`
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Set the color</title>
    </head>
    <body style="background-color: ${color}">
    <p>Session data was reset. <a href='/setBgColor'>Go back to start page</a></p>
    </html>`)
})

app.all("*", (req, res) => {
    res.status(304).redirect("/setBgColor")
})

app.listen((PORT), () => {
    console.log('App listening on port 3000!');
});