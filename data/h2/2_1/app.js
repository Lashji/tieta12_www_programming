const http = require("http");
const fileName = "./db";
const xssFilters = require("xss-filters");
const fs = require("fs");
const port = 3000;

http
    .createServer((req, res) => {
        let fullUrl = "http://" + "none" + req.url;
        let url = new URL(fullUrl);

        res.setHeader("Content-Type", "text/plain");

        req.on("error", err => {
            console.log(err);
            req.statusCode = 400;
            req.end();
        });

        req.on("error", e => {
            console.log(e);
        })

        handleRequest(req, res, url.pathname);
    })
    .listen(port);

const handleRequest = (req, res, path) => {
    switch (req.method) {
        case "GET":
            if (path == "/data/export") {
                fs.readFile(fileName, (err, data) => {
                    if (err) throw err;

                    res.statusCode = 200;
                    res.end(xssFilters.inHTMLData(data));
                });
            } else {
                notFound(res);
            }
            break;
        case "PUT":
            if (path == "/data/import") {
                let body = [];
                req.on("error", e => {
                        console.log(e);
                    })
                    .on("data", chunk => {
                        body.push(chunk);
                    })
                    .on("end", () => {
                        res.on("error", err => {
                            console.log(err);
                        });
                        let file = fs.createWriteStream(fileName, {
                            flags: "a", //append
                        });
                        body = Buffer.concat(body).toString();

                        file.write(body);
                        file.write("\n");
                        file.end();

                        res.statusCode = 200;
                        res.end();
                    });
            } else {
                notFound(res);
            }
            break;
        default:
            notFound(res);
            break;
    }
};

const notFound = res => {
    res.statusCode = 404;
    res.end();
};