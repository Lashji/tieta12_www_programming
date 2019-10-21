const http = require("http")
const fs = require("fs")
const EventEmitter = require("events")
let file = fs.createWriteStream("./top_secret.txt")

class MyEvent extends EventEmitter{}

const hostname = "0.0.0.0"
const port = 3000


const myEvent = new MyEvent()

myEvent.on("sendResponse", (num, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(num.toString())
})

myEvent.on('cryptic', (num, res) => {
    try {
        file.write(num.toString(), () => {
            myEvent.emit("sendResponse", num, res)
            file.end()      
        })
    } catch (error) {
        throw "error"
    }
})


const server = http.createServer((req, res) => {
    // this was called twice because of favicon so returning when not calling root
    if (req.url != "/")
        return
    
    file = fs.createWriteStream("./top_secret.txt")

    let num = getNum()
    myEvent.emit("cryptic", num, res)

})


function getNum() {
    return Math.floor(Math.random() * 2019)
}

server.listen(port, hostname)