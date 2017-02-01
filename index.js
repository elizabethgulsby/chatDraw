//main driver - node server, etc lives here (we're writing nodejs here)
//errors here will kick out in the terminal rather than the browser
//node DOES NOT serve files!
// console.log("Sanity Check!!")


//Include http and fs
var http = require('http');
var fs = require('fs');

var server = http.createServer((req, res) => {  //commented out because static-server.js is serving static content for us now
	// console.log("Someone connected via http!");
	// fs.readFile('index.html', 'utf-8', (error, fileData) => {  //reading the contents of index.html
	// 	if (error) {
	// 		// respond with a 500 console error!
	// 		res.writeHead(500, {"content-type": "text/html"})
	// 		res.end(error);  //will send the user the error received when file was attempted to be read
	// 	}
	// 	else {
	// 		// the file was able to be read in
	// 		res.writeHead(200, {"content-type": "text/html"})
	// 		res.end(fileData) //will send the fileData if successful
	// 	}
	// });
});

//include server version of socket.io and assign it to a variable
var socketIo = require('socket.io');
// Sockets are going to listen to the server, which is listening on port 8080
var io = socketIo.listen(server); 

//so we can have multiple users
var socketUsers = [];

// Handle socket connections... (event handler (listener) below - "on")
// let me know anytime a socket connects, run attached anonymous function
io.sockets.on('connect', (socket) => { //only happens once - initially - whenever someone connects to socket
	console.log("Someone connected by socket!");
	socketUsers.push({ //push onto the array the following properties
		socketID: socket.id, //whatever the id is of the socket that just connected 
		name: "Anonymous"
	})
	io.sockets.emit('users', socketUsers); //we created users event - if someone connects, send the event and send the socketUsers array along with it

	//when someone connects, we let everyone know someone connected, and then we add a listener to that socket for that event (we have to attach a listener to every single socket) - if someone sends a message, we emit it to all sockets
	socket.on('messageToServer', (messageObject) =>{
		console.log("Someone sent a message!  It is", messageObject.message);
		io.sockets.emit('messageToClient', { //message that will be emitted to the client on send
			message: messageObject.message,
			date: new Date()
		});
	});
	// outputs drawing to clients when drawing on canvas
	socket.on('drawingToServer', (drawingData) => {
		if (drawingData.lastMousePosition !== null) {
			io.sockets.emit('drawingToClients', drawingData);
		}
	});
}); 


server.listen(8080);
console.log("Listening on port 8080...");
