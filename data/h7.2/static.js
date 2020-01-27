'use strict'

window.addEventListener('load', () => {


	getData()
	const form = document.getElementById("addPlayerForm")

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		submitData(form)
	})

})

const submitData = (form) => {
	const FD = new FormData(form)

	console.log(FD)
	let jsonObject = {};
	for (const [key, value] of FD.entries()) {
		jsonObject[key] = value;
	}

	jsonObject["active"] = jsonObject["active"] === "on"
	fetch("http://localhost:3000/api/players", {
			headers: {
				'Accept': 'application/json',
				'Content-Type': "application/json"
			},
			method: "POST",
			cache: "no-cache",
			body: JSON.stringify(jsonObject)
		})
		.then(res => {
			console.log("res", res)
			return res.json()
		})
		.then(res => {
			refresh(res)
		})
}

const getData = () => {
	fetch("http://localhost:3000/api/players", {
			method: "GET",
			cache: "no-cache"
		})
		.then(res => res.json())
		.then(res => loadPage(res))
}


const addContainer = () => {
	let ul = document.createElement("ul")
	document.getElementById("app").appendChild(ul)
	ul.setAttribute("style", "list-style-type:none;")
	return ul
}


const loadPage = (data) => {
	console.log("data", data)
	const ul = addContainer()
	const players = data.players.players
	for (let i in players) {
		let li = document.createElement("li")

		let btn = document.createElement("input")
		btn.setAttribute("style", "margin:2px;")
		btn.type = "button"
		btn.value = players[i].name
		btn.addEventListener('click', () => {
			selectPlayer(players[i])
		})

		li.appendChild(btn)
		ul.appendChild(li)
	}

}


const selectPlayer = (player) => {
	console.log(player)
	const selflink = player.links.self.href
	console.log(selflink)

	const hook = document.getElementById("player")
	const template = `
		<p style="margin-left:45px; display:inline-block">Name: ${player.name}, is active: ${player.active} </p>
	`
	hook.innerHTML = template;

	const btn = document.createElement("input")
	btn.type = "button"
	btn.value = "Delete this player"
	btn.target = selflink
	btn.addEventListener('click', function () {
		destroy(this.target, refresh)
	})

	if (player.active) {

		const activeBtn = document.createElement("input")
		activeBtn.type = "button"
		activeBtn.value = "Set Inactive"
		activeBtn.target = selflink;

		activeBtn.addEventListener("click", function () {
			updateActivity(this.target, refresh)
		})
		hook.appendChild(activeBtn)
	}

	hook.appendChild(btn)
}

const destroy = (target, callback) => {
	fetch(target, {
		method: "DELETE"
	})
	callback();
}

const updateActivity = (target, callback) => {
	fetch(target, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': "application/json"
			},
			method: "PUT",
			body: JSON.stringify({
				active: false
			})
		})
		.then(res => res.json())
		.then(res => {
			callback(res);
		})
}

const refresh = (player) => {
	replace("app")
	replace("player")
	getData();
	if (player) {
		selectPlayer(player)
	}
}

const replace = (id) => {
	let app = document.getElementById(id)
	let parent = app.parentNode
	let div = document.createElement('div')
	div.id = id
	parent.replaceChild(div, app)
}