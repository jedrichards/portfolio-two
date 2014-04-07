/**
 * Syncs the project documents in the db with the versions in the app source code.
 */

var projects = require('../data/projects.json');
var tools = require('couchdb-tools');
var util = require('util');

module.exports = populate;

function* populate (db) {
    process.stdout.write("Syncing project documents ... ");
    projects.forEach(function (project) {
        project._id = tools.slug(project.name);
        project.type = 'project';
    });
    var remotes = (yield db.view('projects','projectsById'))[0];
    remotes = tools.normalise(remotes);
    var sync = tools.sync(projects,remotes);
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
