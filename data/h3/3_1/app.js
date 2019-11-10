const express = require("express")
const cookieParser = require("cookie-parser")
const expressSanitizer = require("express-sanitizer")
const xssFilters = require("xss-filters");
const app = express()
const PORT = 3000

app.use(express.urlencoded())
app.use(cookieParser())
app.use(expressSanitizer())

app.get("/cookiejar", (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.end(`<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Cookiejar</title>
    </head>
    <body>
    <form action="/cookiejar" method="post">
    <input type="hidden" id="firstCookie" name="first" value="<script>alert()</script>user11111">
    <input type="hidden" id="secondCookie" name="second" value="pasword1234?">
    <input type="hidden" id="thirdCookie" name="third" value="admin">
    <button type="submit">Submit</button>
    </form>
    </html>`)
})

app.get("/requestCookies", (req, res) => {
    res.setHeader("Content-Type", "text/html")

    cookies = req.cookies
    console.log(cookies)

    res.write(`<!doctype html>
    <html lang="en">
    <head><meta charset="utf-8">
    <title>Cookies!</title>
    </head>
    <body>
    <ul>`);

    count = 1

    for (let c in cookies) {

        cookieStr = xssFilters.inHTMLData(`Cookie${count} = ${c}: ${cookies[c]} `)

        res.write(`<li>${cookieStr}</li>`)
        count++
    }

    res.end(` </ul>
    <a href='/cookiejar'>Here's a link back</a>
    </body>
    </html>`);

})

app.post("/cookiejar", (req, res) => {
    const body = req.body
    c1_data = req.sanitize(body.first)
    c2_data = req.sanitize(body.second)
    c3_data = req.sanitize(body.third)

    res.cookie("username", c1_data)
    res.cookie("password", c2_data)
    res.cookie("userrole", c3_data)

    res.setHeader("Content-Type", "text/html")
    res.send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cookies!</title></head><body><a href="/requestCookies">Go see the cookies!</a></body></html>')
})



app.listen(PORT, () => console.log("server started"))