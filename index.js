var net = require('net');
var http = require('http');
var fs = require('fs');
var winston = require("winston");

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({filename: 'proxy.log'})
    ]
});

class HttpRequest {
    constructor(attrs) {
        this.attrs = attrs;
        this.logSomething = this.logSomething.bind(this);
        this.forwardRequest = this.forwardRequest.bind(this);
    }

    // TODO - not working yet. will come back to this.
    logSomething() {
        logger.log({
            level: 'info',
            message: this.attrs
        })
    }

    forwardRequest() {

    }
}

/**
 * Parse an HTTP request.
 * @param {String} bytes 
 */
async function parseHttpRequest(bytes) {
    let httpRequestAttrs = {headers: ""};

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
            httpRequestAttrs.headers = httpRequestAttrs.headers.concat(row + "\r\n");
        }
    });

    return new HttpRequest(httpRequestAttrs);
}

/**
 * Log the request and forward it.
 * @param {String} bytes 
 */
async function logAndSend(bytes) {
    console.log(bytes)
}


function startServer() {
    var server = net.createServer((socket) => {
        socket.on('end', (c) => {
            console.log("Client disconnected");
        });
        socket.on("data", (c) => {
            parseHttpRequest(c.toString())
                .then((req) => {
                    req.logSomething();
                })
        });
    })

    server.on('connection', (c) => {
        console.log("Client connected!");
    });

    server.listen(8124, () => {
        console.log("Server bound.");
    });

    return server;
}

startServer();
module.exports = [parseHttpRequest];
