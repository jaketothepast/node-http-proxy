var net = require('net');

/**
 * Log the request and forward it.
 * @param {String} bytes 
 */
async function logAndSend(bytes) {
    console.log(bytes)
}

var server = net.createServer((socket) => {
    socket.on('end', (c) => {
        console.log("Client disconnected");
    });
    socket.on("data", (c) => {
        logAndSend(c.toString());
    });
})

server.on('connection', (c) => {
    console.log("Client connected!" + c.read(10));
});

server.on("listening", (c) => {
    console.log("LISTENING");
})

server.listen(8124, () => {
    console.log("Server bound.");
})