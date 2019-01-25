var net = require('net');
var http = require('http');

class HttpRequest {
    constructor({...attrs}) {
        this.type = attrs.type;
        this.headers = attrs.headers;
        this.body = attrs.body;
    }
}

/**
 * Parse an HTTP request.
 * @param {String} bytes 
 */
function parseHttpRequest(bytes) {
    let httpRequestAttrs = {};

    bytes.split("\r\n").map((row) => {
        // Match against HTTP verbs from the first row.
        if (row.match('GET|POST|PUT|PATCH|UPDATE|DELETE')) {
            console.log("FIRST ROW");
            console.log(row);
            let typeInfo = row.split(" ");

            if (typeInfo.length !== 3) {
                console.log("Bad HTTP request");
                return null;
            }

            httpRequestAttrs["type"] = typeInfo[0];
            httpRequestAttrs["path"] = typeInfo[1];
            httpRequestAttrs["httpVersion"] = typeInfo[2];
        } else {
            console.log(row);
        }
    })
}

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
        parseHttpRequest(c.toString());
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