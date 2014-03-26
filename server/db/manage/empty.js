/**
 * Deletes all documents in the database.
 */
var tools = require('couchdb-tools');

module.exports = empty;

function* empty (db) {
    var docs = (yield db.list())[0];
    docs = tools.normalise(docs);
    if ( docs.length == 0 ) return console.log('Database was already empty');
    docs.forEach(function (doc) {
        doc._deleted = true;
    });
    yield db.bulk({docs:docs});
    console.log('Database emptied, '+docs.length+' docs deleted');
}
