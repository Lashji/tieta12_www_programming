const finalhandler = require("finalhandler");
const http = require("http");
const Router = require("router");
const xssFilters = require("xss-filters");
const port = 3000;
const fs = require("fs");
const router = Router();


router.get('/texts/:filename', (req, res) => {

    let fileName = req.params.filename

    if (fileName == undefined) {
        res.statusCode = 404;
        res.end()
    }


    fs.readFile(fileName, (err, data) => {

        if (err) {
            console.log("Error when making request")
            res.statusCode = 404
            res.end("Error when making request. Please try to post data before requesting it")
            return
        }

        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 200;
        res.end(xssFilters.inHTMLData(data));
    });


})

router.post('/texts', (req, res) => {
    let body = []

    let fileName = getFileName(req)

    if (fileName == undefined) {
        console.log("Retrieving filename failed")
        res.statusCode = 400
        res.end()
    }

    fileName = fileName.toString()

    req.on("data", chunk => {
        body.push(chunk)
    }).on("end", () => {
        body = Buffer.concat(body).toString()
        const file = fs.createWriteStream(fileName, {
            flags: 'a'
        })
        file.write(body)
        file.write("\n")
        file.end()

        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 200;
        res.end();
    })

})


const getFileName = (req) => {
    let url = new URL('http://' + req.url)
    return url.searchParams.get("fileName")
}

const server = http.createServer((req, res) => {
    req.on('error', err => {
        console.log(err)
        res.statusCode = 400
        res.end()
    })
    res.on('error', err => {
        console.log(err)
    })
    router(req, res, finalhandler(req, res));
}).listen(port)