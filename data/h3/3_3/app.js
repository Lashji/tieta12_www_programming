const express = require("express")
const sanitizer = require("express-sanitizer")
const session = require("express-session")
const helmet = require("helmet")
const csrf = require("csurf")
const PORT = 3000
const app = express()

let users = [{
        id: 1,
        username: "Platon",
        password: "The",
        posts: ["thought1"]
    },
    {
        id: 2,
        username: "Socrates",
        password: "ancient",
        posts: ["thought1", "thought2"]
    },
    {
        id: 3,
        username: "Aristoteles",
        password: "Greeks",
        posts: ["thought1", "thought2", "thought3"]
    },
    {
        id: 4,
        username: "admin",
        password: "pw",
        posts: ["I ", "am ", "Th2e1 adm,in"]
    },
];

app.use(helmet())
app.use(session({
    secret: "1234password",
    resave: false,
    saveUninitialized: true,
}))

csrfProtection = csrf()
app.use(express.urlencoded())
app.use(sanitizer())




app.get("/login", csrfProtection, (req, res) => {

    if (req.session.userID !== undefined) {
        res.status(304).redirect(`/quality_content/${req.session.userID}`)
        return
    }

    res.setHeader("Content-Type", "text/html")
    let form = `
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Login</title>
    </head>
    <body>
    <form action="/login" method="POST">
    <input type="text" id="username" name="username" placeholder="Your username">
    <input type="password" id="password" name="password" placeholder="Your password">
    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
    <button type="submit">Submit</button>
    </form>
    </html>`

    res.end(form, {
        csrfToken: req.csrfToken()
    })

})

const authenticate = (req) => {
    let sanitizedUsername = req.sanitize(req.body.username)
    let sanitizedPassword = req.sanitize(req.body.password)

    let found = users.find(({
        username,
        password
    }) => username === sanitizedUsername && password === sanitizedPassword)

    return found
}

app.post("/login", csrfProtection, (req, res) => {

    user = authenticate(req)
    req.method = "GET"

    if (user) {
        if (!req.session.userID) {
            req.session.userID = user.id
            req.session.loggedInUser = user
        }

        res.status(304).redirect(`/quality_content/${req.session.userID}`)

    } else {
        res.status(304).redirect("/login")
        return
    }


})

// Image 2
app.get('/quality_content/:user_id', csrfProtection, (req, res) => {
    if (req.session.userID === undefined) {
        res.status(304).redirect("/login")
        return
    }
    res.setHeader("Content-Type", "text/html")

    let param_id = req.params.user_id
    let users_content_url = `/quality_content/${req.session.userID}`
    let user_form = `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Login</title>
    </head>
    <body>
    <p>${req.session.loggedInUser.posts}</p>
    <form action="/logout" method="GET">
    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
    <button type="submit">Log out</button>
    </form>
    </html>`
    let wrongIdForm = `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Login</title>
    </head>
    <body>
    <p>Not your content! Yours can be <a href="${users_content_url}">found here.</a>
    </html>`
    if (req.session.userID.toString() === param_id) {
        res.send(user_form);
    } else {
        res.send(wrongIdForm);
    }
});

app.get("/logout", csrfProtection, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.statusCode = 500
            res.end();
        }
        res.status(304).redirect("/login")
    })

})

app.get("*", (req, res) => {
    res.status(304).redirect("/login")
})

app.listen(PORT, () => {
    console.log('App listening on port 3000!');
});