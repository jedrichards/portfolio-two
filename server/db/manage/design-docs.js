/**
 * Syncs the design docs in the db with the versions in the app source code.
 */

var ddocs = require('require-all')(process.cwd()+'/db/design');
var tools = require('couchdb-tools');
var util = require('util');

module.exports = designDocs;

function* designDocs (db) {
    process.stdout.write("Syncing design documents ... ");
    var remotes = (yield db.list({'include_docs':true,startkey:'_design',endkey:'_e'}))[0];
    remotes = tools.normalise(remotes);
    var locals = Object.keys(ddocs).map(function (key) {
        return tools.ddoc(ddocs[key]);
    });
    var sync = tools.sync(locals,remotes);
    var docs = [];
    docs = docs.concat(sync.onlyOld.map(function (doc) {
        doc._deleted = true;
        return doc;
    }));
    docs = docs.concat(sync.onlyNew);
    docs = docs.concat(sync.bothAndUnEqual.map(function (doc) {
        doc.new._rev = doc.old._rev;
        return doc.new;
    }));
    if ( docs.length > 0 ) yield db.bulk({docs:docs});
    process.stdout.write(util.format('%s deleted, %s added, %s updated\n',sync.onlyOld.length,sync.onlyNew.length,sync.bothAndUnEqual.length));
}
