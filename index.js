var http = require('http');
var winston = require("winston");
var fs = require("fs");
var myDb = require("./lib/db.js");
const url = require("url");

// Rudimentary logger.
// TODO - Make this filename configurable.
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({filename: 'proxy.log'})
    ]
});

/**
 * Connection handler for proxy, forward request and then pipe response
 * back to the client.
 *
 * @param {IncomingMessage} request The request from the client
 * @param {OutgoingMessage} response The response to write back to the client
 */
const processRequest = (request, response) => {
    let body = [];
    // Use closure for request.
    let req = request;
    let res = response;

    // Set up a data handler for the socket connection.
    request.on("data", (chunk) => {
        body.push(chunk);
    });

    // Set up an end handler for the socket connection.
    request.on("end", () => {
        body = Buffer.concat(body).toString();
        logger.info({message: "Requesting: " + req.url});

        const hostUrl = new url.URL(req.url);

        // Do the work of actually updating our db with the visit.
        // Val in the callback will be false if blocked.
        myDb.visitHost(hostUrl.hostname, (val) => {
            if (val === false) {
                // blocked.
                console.log("Blocked you fool.")
                sendBlockPage(res);
            } else {
                // Not blocked
                req.pipe(http.request(req.url, (resp) => {
                    resp.pipe(res);
                }))
            }
        });
    });
}

/**
 * Send a block page back to the client.
 * @param {OutgoingMessage} res Response to the client
 */
function sendBlockPage(res) {
    res.writeHead(403, {
        'Content-Type': 'text/html',
        'X-Powered-By': 'bacon'
    })
    res.write('<html><body><h1>BLOCKED BY MY PROXY</h1></body></html>');
    res.end();
}

/**
 * Start the server.
 */
function startServer() {
    // Start the server, set up data and end handlers.
    var server = http.createServer(processRequest);

    // Start the server
    server.listen(8124, () => {
        console.log("Server bound.");
    });

    return server;
}

myDb.initializeDatabase();
startServer();

