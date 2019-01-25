var net = require('net');

async function logAndSend(bytes) {

}

var server = net.createServer((socket) => {
    socket.on('end', (c) => {
        console.log("Client disconnected");
    });
})

server.on('connection', () => {
    console.log("Client connected!");
});

server.listen(8124, () => {
    console.log("Server bound.");
})