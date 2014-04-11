var tools = require('couchdb-tools');

module.exports = projects;

function projects (route) {
    return route.get('/api/projects/:id',function* (id) {
        var res = yield this.app.db.view('projects','projectsById',{key:id});
        res = tools.normalise(res[0]);
        this.body = res;
    });
}
