/**
 * Deletes all documents in the database.
 */

var tools = require('couchdb-tools');
var util = require('util');

module.exports = empty;

function* empty (db) {
    process.stdout.write("Deleting all documents ... ");
    var docs = (yield db.list())[0];
    docs = tools.normalise(docs);
    if ( docs.length == 0 ) return process.stdout.write("already empty\n");
    docs.forEach(function (doc) {
        doc._deleted = true;
    });
    yield db.bulk({docs:docs});
    process.stdout.write(util.format('%s deleted\n',docs.length));
}
