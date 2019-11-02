const http = require("http")
const xxsFilters = require("xss-filters")
const fs = require("fs")
const port = 3000


http.createServer((req, res) => {

    let fullUrl = 'http://' + 'none' + req.url;
    let url = new URL(fullUrl);

    handleRequest(req.method, url.pathname, res)
    console.log(url)

}).listen(port)


const handleRequest = (method, path, res) => {


    switch (method) {
        case "GET":
            if (path == "/data/export") {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('EXPORTING');
            }
            break
        case "PUT":
            if (path == "/data/import") {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('importing');
            }

            break
    }



}