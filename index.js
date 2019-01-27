var http = require('http');
var winston = require("winston");
var fs = require("fs");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("./proxy.db");
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
        logger.info({message: "Got a message!"});
        logger.info({message: "Requesting: " + req.url});

        const hostUrl = new url.URL(req.url);
        addHostToTable(hostUrl.hostname);
        // Complicated line of JS to forward request, and pipe it to the
        // response object.
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

/** TODO - MAKE THESE FUNCTIONS THEIR OWN MODULE. VVV 
 *  FIXME - need to close the database connection
 *          on exit.
 */

/**
 * Initialize our database.
 */
function initializeDatabase() {
    db.serialize(() => {
        db.run("create table hosts (hostname TEXT visitcount INTEGER)", (res, err) => {
            if (err !== undefined || err !== null) {
                console.log("Error creating database, it likely exists already.");
            }
        });
    });
    // db.close();
}

/**
 * Update the visit count for a host logged by the proxy
 * @param {string} hostname Host logged by proxy
 */
function updateVisitCount(hostname) {
    db.serialize(() => {
        db.run("update hosts set visitcount = visitcount + 1 where hostname = (?)", [hostname]);
    });
    // db.close();
}

function addHostToTable(hostname) {
    db.serialize(() => {
        db.run("insert into hosts (hostname visitcount) values (? ?)", [hostname, 0])
    })
    // db.close();
}

initializeDatabase();
startServer();
