const finalhandler = require("finalhandler");
const http = require("http");
const Router = require("router");
const xssFilters = require("xss-filters");
const port = 3000;
const fs = require("fs");
const fileName = "./web-text.txt";
const router = Router();



router.get("/resources", (req, res) => {
    res.setHeader("Content-Type", "text/plain");

    fs.readFile(fileName, (err, data) => {
        if (err) {
            console.log("404 file not found")
            res.statusCode = 404
            res.end("Error when making request. Please try to post data before requesting it")
            return
        }
        res.statusCode = 200;
        res.end(xssFilters.inHTMLData(data));
    });
});

router.post("/resources", (req, res) => {
    let body = [];
    req
        .on("data", chunk => {
            body.push(chunk);
        })
        .on("end", () => {
            body = Buffer.concat(body).toString();
            const file = fs.createWriteStream(fileName, {
                flags: "a",
            });
            file.write(body);
            file.write("\n");
            file.end();

            res.setHeader("Content-Type", "text/plain");
            res.statusCode = 200;
            res.end();
        });
});

router.get("*", (req, res) => {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/plain");
    res.end()
})

const server = http
    .createServer((req, res) => {
        req.on('error', err => {
            console.log(err)
            res.statusCode = 400
            res.end()
        })
        res.on('error', err => {
            console.log(err)
        })
        router(req, res, finalhandler(req, res));
    })
    .listen(port);