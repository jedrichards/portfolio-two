var tools = require('couchdb-tools');

module.exports = projects;

function projects (route) {
    return route.get('/api/projects',function* () {
        var res = yield this.app.db.view('projects','projectsByDate',{descending:true});
        var projects = res[0];
        projects = tools.normalise(projects);
        this.body = projects;
    });
}
