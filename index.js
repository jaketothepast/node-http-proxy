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


function startServer() {
    // Start the server, set up data and end handlers.
    var server = http.createServer();
    server.on('request', (request, response) => {
        let body = [];
        // Use closure for request.
        let req = request;
        let res = response;

        request.on("data", (chunk) => {
            body.push(chunk);
        }).on("end", () => {
            body = Buffer.concat(body).toString();
            logger.info({message: "Got a message!"});
            logger.info({message: req});
        })
    })

    // Start the server
    server.listen(8124, () => {
        console.log("Server bound.");
    });

    return server;
}

startServer();
module.exports = [parseHttpRequest];
