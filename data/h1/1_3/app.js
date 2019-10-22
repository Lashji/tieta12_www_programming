
const fs = require("fs")
const filePath = "./strings.txt"
const file = fs.createWriteStream(filePath, {flags:"a", fd:null})
const args = process.argv.slice(2)

file.on('error', (err) => { log(err)});

const main = () => {
    
    if (args.length == 0){
        console.log("Error parsing command line")
        process.exit(-1)
    }
    
    if (args[0] == "delete"){
        deleteFile()
        return
    }
    
    file.write(args[0] + "\n")
    file.end()

}

const deleteFile = () => {
    fs.unlink(filePath, (err) => {
        if (err) throw err
        console.log(`${filePath} was deleted`)
    })
}

main()