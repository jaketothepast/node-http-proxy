var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("./proxy.db");
var winston = require("winston");

var fs = require('fs');

// JSON file to configure hosts we should block.
const blockedFile = "./lib/blocked.json"

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({filename: '../proxy.log'})
    ]
});

/** TODO - MAKE THESE FUNCTIONS THEIR OWN MODULE. VVV 
 *  FIXME - need to close the database connection
 *          on exit.
 */

function logErrorAndExit(message) {
    logger.error(message)
    process.exit(1)
}

/**
 * Initialize our database.
 */
exports.initializeDatabase = function() {
    db.serialize(() => {
        db.run("create table if not exists hosts (hostname TEXT, visitcount Int)", (err, row) => {
            if (err !== null) {
                logErrorAndExit("Error creating table hosts: " + err)
            }
        });

        try {
            fs.readFile(blockedFile, (err, data) => {
                if (err !== null)
                    throw err
                
                // console.log(JSON.parse(data))
                let blockedData = JSON.parse(data)
                db.run("create table if not exists blocked_hosts (hostname TEXT)", (err, row) => {
                    if (err !== null) {
                        logErrorAndExit("Error creating table blocked_hosts: " + err)
                    }
                })

                db.get("select count(*) from blocked_hosts", (err, row) => {
                    if (err !== null) {
                        logErrorAndExit("Error getting count of blocked_hosts")
                    }
                    // if (blockedData.hosts.length  row['count(*)'])
                    for (let host of blockedData.hosts) {
                        db.get("select hostname from blocked_hosts where hostname = ?", [host], (err, row) => {
                            if (err !== null) {
                                db.run("insert into blocked_hosts (hostname) values (?)", [hostname]);
                            }
                            // TODO -- run a diff for whatever has been deleted from the config file. 
                        })
                    }
                })

            })
        } catch(err) {
            console.log(err)
            logErrorAndExit("Could not find blocked.json, does it exist?")
        }
    });

    // fs.accessSync("./blocked.json")
}

/**
 * Update the visit count for a host logged by the proxy
 * @param {string} hostname Host logged by proxy
 */
function updateVisitCount(hostname) {
    db.serialize(() => {
        db.run("update hosts set visitcount = visitcount + 1 where hostname = ?", [hostname]);
    });
}

/**
 * Add a row for a host to the hosts table.
 * @param {string} hostname Host that was freshly visited.
 */
function addHostToTable(hostname) {
    db.serialize(() => {
        db.run("insert into hosts (hostname, visitcount) values (?, 0)", [hostname]);
    })
}

/**
 * Either initialize a row in the database, or update the visit count for a row.
 * @param {string} hostname Host that was visited
 */
exports.visitHost = function (hostname, callbackFn) {
    return db.serialize(() => {
        db.get("select * from hosts where hostname = ?", [hostname], (err, row) => {
            if (row === undefined) {
                addHostToTable(hostname);
                callbackFn(true);
            } else {
                // Do the blocking, make this configurable.
                if (row.visitcount >= 2) {
                    callbackFn(false);
                } else {
                    updateVisitCount(hostname);
                    callbackFn(true);
                }
            }
        });
    });
}
