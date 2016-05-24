var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 4242 });

var colors = {
	turquoise: "78edd5",
	emerald: "82e3aa",
	peter_river: "7dbde8",
	amethyst: "bf95d0",
	wet_asphalt: "34495e"
};

var config = {
	serverName: "IziMsg",
	colors: colors
};

wss.on('connection', function(ws) {
	ws.username = undefined;
	ws.color = undefined;

	config.usedColors = getUsedColors(wss);

	ws.send(JSON.stringify(config));

	ws.on('message', function(res) {
		console.log('received: %s', res);
		//parse message to JSON
		try {
			var msg = JSON.parse(res);

			if (msg.user) {
				ws.username = msg.user;
			}
			if (msg.color) {
				if (colors[msg.color]) {
					if (getUsedColors(wss).indexOf(msg.color) == -1) {
						ws.color = msg.color;
					} else {
						sendError(ws, "color_already_used");
					}
				} else {
					sendError(ws, "color_not_exist");
				}
			}
			if (ws.username && ws.color && msg.msg) {
				var send = {};
				send.user = ws.username;
				send.color = ws.color;
				send.msg = msg.msg;
				wss.broadcast(JSON.stringify(send));
			}
		} catch (e) {
			sendError(ws, "Are you idiot?");
			console.log(e);
		}
	});

});

wss.broadcast = function(data) {
	wss.clients.forEach(function(client) {
		client.send(data);
	});
};

function getUsedColors(wss) {
	var used = [];
	wss.clients.forEach(function(client) {
		if (used.indexOf(client.color) == -1) {
			used.push(client.color);
		}
	});
	return used.filter(Boolean);
}

function sendError(ws, text) {
	var r = {};
	r.error = text;
	ws.send(JSON.stringify(r));
}
