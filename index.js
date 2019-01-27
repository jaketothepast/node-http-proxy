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
    })
    
    // Set up an end handler for the socket connection.
    request.on("end", () => {
        body = Buffer.concat(body).toString();
        logger.info({message: "Requesting: " + req.url});

        const hostUrl = new url.URL(req.url);
        myDb.visitHost(hostUrl.hostname);
        // Complicated line of JS to forward request, and pipe it to the
        // response object.
        //
        // Uses closures to ensure that both req and res are what I want.
        req.pipe(http.request(req.url, (resp) => {resp.pipe(res)}));
    });
}

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

