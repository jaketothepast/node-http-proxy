var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("./proxy.db");

/** TODO - MAKE THESE FUNCTIONS THEIR OWN MODULE. VVV 
 *  FIXME - need to close the database connection
 *          on exit.
 */

/**
 * Initialize our database.
 */
exports.initializeDatabase = function() {
    db.serialize(() => {
        db.run("create table hosts (hostname TEXT, visitcount Int)", (err, row) => {
            if (err !== undefined || err !== null) {
                console.log("Error creating database, it likely exists already.");
            }
        });
    });
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
