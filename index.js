var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 4242 });

wss.on('connection', function(ws) {
	var username = undefined;

	ws.on('message', function(res) {
		console.log('received: %s', res);
		//parse message to JSON
		var msg = JSON.parse(res);

		if (msg.user) {
			username = msg.user;
		} else if (msg.msg) {
			var send = {};
			send.user = username;
			send.msg = msg.msg;
			wss.broadcast(JSON.stringify(send));
		}
	});

});

wss.broadcast = function(data) {
	wss.clients.forEach(function(client) {
		client.send(data);
	});
};
