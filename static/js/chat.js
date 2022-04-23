"use strict";

/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

const name = prompt("Username? (no spaces)");

/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
	console.log("open", evt);

	let data = { type: "join", name: name };
	ws.send(JSON.stringify(data));
};

/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
	console.log("message", evt);

	let msg = JSON.parse(evt.data);
	let item;

	if (msg.type === "note") {
		item = $(`<li><i>${msg.text}</i></li>`);
	} else if (msg.type === "chat") {
		item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
	} else if (msg.type === "get-joke") {
		item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
	} else if (msg.type === "members") {
		item = $(`<li><b>${msg.name}: </b>In room: ${msg.members.join(", ")}</li>`);
	} else if (msg.type === "priv") {
		item = $(
			`<li><b><i>FROM ${msg.name}, TO ${msg.toUser}: </i></b>${msg.text}</li>`
		);
	} else {
		return console.error(`bad message: ${msg}`);
	}

	$("#messages").append(item);
};

/** called on error; logs it. */

ws.onerror = function (evt) {
	console.error(`err ${evt}`);
};

/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
	console.log("close", evt);
};

/** send message when button pushed. */

$("form").submit(function (evt) {
	evt.preventDefault();

	let data;
	if ($("#m").val() === "/joke") {
		data = { type: "get-joke" };
	} else if ($("#m").val() === "/members") {
		data = { type: "members" };
	} else if ($("#m").val().startsWith("/priv")) {
		const values = $("#m").val().split(" ");
		if (!values[1] || !values[2]) {
			$("#m").val("");
		} else {
			data = {
				type: "priv",
				text: values.slice(2).join(" "),
				toUser: values[1],
			};
		}
	} else {
		data = { type: "chat", text: $("#m").val() };
	}
	ws.send(JSON.stringify(data));

	$("#m").val("");
});
