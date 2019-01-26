var net = require('net');
var http = require('http');
var fs = require('fs');
var winston = require("winston");
var rp = require("request-promise");

// Rudimentary logger.
// TODO - Make this filename configurable.
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({filename: 'proxy.log'})
    ]
});

/**
 * HttpRequest class,
 * 
 * Encapsulates logging a request.
 * 
 * TODO - Enable request forwarding here.
 */
class HttpRequest {
    constructor(attrs) {
        this.attrs = attrs;
        this.logSomething = this.logSomething.bind(this);
        this.forwardRequest = this.forwardRequest.bind(this);
    }

    /**
     * Using Winston, log the request.
     */
    logSomething() {
        logger.log({
            level: 'info',
            message: this.attrs
        })
    }

    /**
     * Forward the request, returning a promise for the result.
     * 
     * TODO - Implement me.
     */
    forwardRequest(callbackFn) {
        console.log("Forwarding.")
        http.request({
            host: this.attrs.headers.Host,
            method: this.attrs.Method,
            headers: this.attrs.headers
        }, callbackFn);
    }
}

/**
 * Parse an HTTP request.
 * @param {String} bytes 
 */
async function parseHttpRequest(bytes) {
    // Object to eventually save in HttpRequest class.
    let httpRequestAttrs = {headers: {}};

    // Parse request row by row.
    bytes.split("\r\n").map((row) => {
        // Match against HTTP verbs from the first row.
        if (row.match('GET|POST|PUT|PATCH|UPDATE|DELETE')) {
            let typeInfo = row.split(" ");

            // Malformed if there aren't at least 3 items here.
            if (typeInfo.length !== 3) {
                console.log("Bad HTTP request");
                return null;
            }

            httpRequestAttrs["Method"] = typeInfo[0];
            httpRequestAttrs["Path"] = typeInfo[1];
            httpRequestAttrs["HttpVersion"] = typeInfo[2];
        } else {
            // Headers, parse accordingly
            let currentRow = row.split(":");
            if (currentRow[0] !== '')
                httpRequestAttrs.headers[currentRow[0]] = currentRow[1].trim();
        }
    });

    return new HttpRequest(httpRequestAttrs);
}


function startServer() {
    // Start the server, set up data and end handlers.
    var server = net.createServer((socket) => {
        socket.on('end', (c) => {
            console.log("Client disconnected");
        });
        socket.on("data", (c) => {
            // Parse HTTP Request returns promise for HttpRequest (async).
            // Log it and pass that along.
            parseHttpRequest(c.toString())
                .then((req) => {
                    req.logSomething();
                    req.forwardRequest((res) => {
                        console.log("Received response");
                        console.log(res);
                    });
                })
        });
    })

    // Connection handler (currently unused).
    server.on('connection', (c) => {
        console.log("Client connected!");
    });

    // Start the server
    server.listen(8124, () => {
        console.log("Server bound.");
    });

    return server;
}

startServer();
module.exports = [parseHttpRequest];
