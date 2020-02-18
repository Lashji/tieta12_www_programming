// API style is from https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design
const express = require("express");
const app = express();
const helmet = require("helmet");
const mongoose = require("mongoose");
const Player = require("../h10.2/player");
const User = require("../h10.2/user");
var api = express.Router();
const ALL_PLAYERS_HREF = "http://localhost:3000/api/players";

mongoose.connect("mongodb://localhost/WWWProgramming", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("connected to database"));

app.use(helmet());
app.use(express.json());

app.use('/', express.static(__dirname + "/public"))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  next()
})


const authFailed = res => {
  console.log("auth failed");
  return res
    .sendStatus(401);
};

const authenticate = async (req, res, next) => {
  console.log(req.body)
  console.log(req.method)
  console.log(req.path)
  console.log("authenticating");
  if (req.path === "/api/users/" && req.method === "POST") return next();
  else if (req.path === "/") return console.log("next") || next();

  if (!req.headers.authorization) {
    console.log("auth failed at header check")
    authFailed(res)
    return
  }

  const encodedHeader = req.headers.authorization.split(' ')[1];
  const decodedHeader = new Buffer(encodedHeader, 'base64').toString();
  const username = decodedHeader.split(':')[0];
  const password = decodedHeader.split(':')[1];

  const user = await User.findOne({
    username
  }).exec();

  if (!user) {
    authFailed(res);
    return;
  }

  let authenticateSuccesful = await user.checkPassword(password);

  if (!authenticateSuccesful) {
    authFailed(res);
    return;
  }

  console.log("Authenticating succesfull");
  next();
};

app.use(authenticate);

api.get("/players/:id", async (req, res) => {
  let player;
  try {
    player = await Player.findById(req.params.id);
  } catch (e) {
    console.log("error finding player")
    handleError(res, e);
    return;
  }

  if (!player) return res.status(404).end()

  player = addLink(player, true);
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

  let players;

  try {
    players = await Player.find().exec();
  } catch (e) {
    handleError(res, e);
    return;
  }
  const playersAsObject = [];

  players.forEach(player => {
    player = addLink(player, false);
    playersAsObject.push(player);
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
    if (err) return res.end("error while saving new player: ", err);
    console.log(player.name + " saved to players collection.");
  });

  player = addLink(player, true);

  res.json(player);
});

api.delete("/players", async (req, res) => {
  let deletion;
  try {
    deletion = await Player.deleteMany({});
  } catch (e) {
    handleError(res, e);
    return;
  }

  console.log(deletion);
  res.status(204).end("Deleted all items in players");
});

api.delete("/players/:id", async (req, res) => {
  let player;

  try {
    player = await Player.deleteOne({
      _id: req.params.id
    });
    console.log("deleted player ", player);
  } catch (e) {
    handleError(res, e);
    return;
  }

  res.status(204).end("Deleted player id " + req.params.id);
});

api.put("/players/:id", async (req, res) => {
  let player;
  let updatedPlayer = {};
  if (req.body.name) updatedPlayer.name = req.body.name;
  if (req.body.active != undefined) updatedPlayer.active = req.body.active;
  console.log("updatedPlayer", updatedPlayer);
  try {
    player = await Player.findOneAndUpdate({
        _id: req.params.id
      },
      updatedPlayer, {
        new: true, // returns the new player
        useFindAndModify: false //using newer mongodb driver instead
      }
    );
  } catch (e) {
    handleError(res, e);
    return;
  }
  player = addLink(player, true);
  res.json(player);
});


api.post("/users", async (req, res) => {
  console.log("/users", req.body)
  if (!Object.keys(req.body).length) return res.sendStatus(400)

  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
    username,
    password
  })

  let save = await user.save((err) => {
    if (err) return res.end("error while saving new user:", err)
    console.log("new user saved to db")
  });

  return res.sendStatus(201)
})

const addLink = (player, linkRoot) => {
  let link = player.link;
  player = player.toObject(); //making player to object so we can add things to it.

  player.links = {
    self: {
      href: link
    }
  };

  if (linkRoot)
    player.links.players = {
      href: ALL_PLAYERS_HREF
    };

  return player;
};

const handleError = (res, e) => {
  console.warn("error: ", e);
  res.status(404).end("Error when doing the request, error message = ", e);
  return;
};

app.use("/api", api);
app.listen(3000, () => console.log("app listening at port 3000!"));