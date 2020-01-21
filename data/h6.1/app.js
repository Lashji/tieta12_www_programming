// API style is from https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design 
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
const Player = require("./player");
var api = express.Router();
const ALL_PLAYERS_HREF = "http://localhost:3000/api/players"

mongoose.connect("mongodb://localhost/WWWProgramming", {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("connected to database"));


app.use(helmet());
app.use(express.json());

api.get("/players/:id", async (req, res) => {
    let player
    try {
        player = await Player.findById(req.params.id)
    } catch (e) {
        handleError(res, e)
        return;
    }
    player = addLink(player, true)
    res.json(player);
});

api.get("/players", async (req, res) => {
    const playerList = {
        links: {
            self: {
                href: ALL_PLAYERS_HREF
            }
        }
    };

    let players

    try {
        players = await Player.find().exec()
    } catch (e) {
        handleError(res, e)
        return;
    }
    const playersAsObject = []

    players.forEach(player => {
        player = addLink(player, false)
        playersAsObject.push(player)
    });

    if (playersAsObject) {
        playerList.players = {
            players: playersAsObject
        };
    }

    res.json(playerList);
});

api.post("/players", async (req, res) => {

    let player = new Player({
        name: req.body.name,
        active: req.body.active
    });

    await player.save(function (err, player) {
        if (err) return console.error(err);
        console.log(player.name + " saved to players collection.");
    });

    player = addLink(player, true)

    res.json(player);
});



const addLink = (player, linkRoot) => {

    let link = player.link
    player = player.toObject() //making player to object so we can add things to it.

    player.links = {
        self: {
            href: link
        }
    };

    if (linkRoot)
        player.links.players = {
            href: ALL_PLAYERS_HREF
        }

    return player
}

const handleError = (res, e) => {
    console.warn("error: ", e)
    res.status(404).end("Error when doing the request, error message = ", e)
    return
}

app.use("/api", api);
app.listen(3000, () => console.log("app listening at port 3000!"));