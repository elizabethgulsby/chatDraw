// !!!!!!!!!!!!!!!!!WEB SOCKET SECTION!!!!!!!!!!!!!!!!!!!
//console.log(io)
// connection request via sockets 
var socketio = io.connect('http://127.0.0.1:8080');

// each time you connect, a new user is added to the socketUsers array (new http, new socket requests - emits to all users the users event)
socketio.on('users', (socketUsers) => {
	console.log(socketUsers);
	var newHTML = '';
	socketUsers.map((currSocket, index) => {
		newHTML += '<li class="user">' + currSocket.name + '</li>';
	});
	document.getElementById('userNames').innerHTML = newHTML;
});

socketio.on('messageToClient', (messageObject) => {
	document.getElementById('userChats').innerHTML += '<div class="message">' + messageObject.message + ' -- ' + messageObject.date + '</div>';
	//displaying newest chats at bottom
	var userChats = document.getElementById('userChats');
	userChats.scrollTop = userChats.scrollHeight;
});

// !!!!!!!!!!!!!!!!!!!!!CLIENT FUNCTIONS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var username;
function getUserName() {
	event.preventDefault();
	username = document.getElementById('username').value;
	// alert(username);
	socketio.emit('userNameInput', {
		name: username
	});
	document.getElementById('username').value = ''; 
}

function sendChatMessage() {  //fires whenever user clicks send buttons
	event.preventDefault();
	var messageToSend = document.getElementById('chat-message').value;
	socketio.emit('messageToServer', {//user sends event, then data sent to server (here in object notation)
		message: messageToSend,
		// name: "Anonymous"
	});
	document.getElementById('chat-message').value = ''; 
}

// !!!!!!!!!!!!!!!!!CANVAS FUNCTIONS!!!!!!!!!!!!!!!!!!!!!!!

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// Set up base options
var color = "#000";
var thickness = 10;
var mouseDown = false;  //stores whether mouse is up or down
var mousePosition = {};
var lastMousePosition = null;
var colorPick = document.getElementById('color-picker');
var thicknessPicker = document.getElementById('thickness');

colorPick.addEventListener('change', (event) => {
	color = colorPick.value;
});

thicknessPicker.addEventListener('change', (event) => {
	thickness = thicknessPicker.value;
});

canvas.addEventListener('mousedown', (event) => {
	// console.log(event);
	mouseDown = true;
});

canvas.addEventListener('mouseup', (event) => {
	// console.log(event);
	mouseDown = false;
	lastMousePosition = null; //enables you to draw WHEREVER YOU WANT ^_^
});

canvas.addEventListener('mousemove', (event) => {
	// console.log(event);
	if (mouseDown) {
		// mouse must be down because we update this boolean in mousedown/mouseup
		var magicBrushX = event.pageX - canvas.offsetLeft;  //event = where user clicked on x (but includes how far away canvas is from left side of page), but need to remove from that however far canvas is from left side of the page (same for Y)
		console.log(canvas.offsetLeft);
		var magicBrushY = event.pageY - canvas.offsetTop; 
		console.log(canvas.offsetTop);
		mousePosition = {
			x: magicBrushX,
			y: magicBrushY
		}
		console.log(mousePosition);
		if (lastMousePosition !== null) {
			context.strokeStyle = color;
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.lineWidth = thickness;
			context.beginPath();
			context.moveTo(lastMousePosition.x, lastMousePosition.y);
			context.lineTo(mousePosition.x, mousePosition.y);
			context.stroke();
			context.closePath();
		}

		var drawingDataForServer = {
			mousePosition: mousePosition,
			lastMousePosition: lastMousePosition,
			color: color,
			thickness: thickness
		}

		// update lastMousePosition
		lastMousePosition = {
			x: mousePosition.x,
			y: mousePosition.y
		}

		socketio.emit('drawingToServer', drawingDataForServer);

		socketio.on('drawingToClients', (drawingData) => {
			console.log(drawingData);
			context.strokeStyle = drawingData.color;
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.lineWidth = drawingData.thickness;
			context.beginPath();
			context.moveTo(drawingData.lastMousePosition.x, drawingData.lastMousePosition.y);
			context.lineTo(drawingData.mousePosition.x, drawingData.mousePosition.y);
			context.stroke();
			context.closePath();
		});
	}
});
