var koa = require('koa');
var files = require('koa-static');
var route = require('koa-route');
var co = require('co');
var nano = require('nano')(process.env.DB_URI);
var conano = require('co-nano')(nano);
var db = conano.use(process.env.DB_NAME);
var actions = process.argv[2];
var pkg = require('./package.json');
var app;

if ( actions ) {
    co(function* () {
        actions = actions.split(',');
        for ( var i=0; i<actions.length; i++ ) {
            var action = actions[i];
            yield require('./db/manage/'+action)(db);
        }
    })();
} else {
    initServer();
}

function initServer () {
    app = koa();
    app.db = db;
    app.outputErrors = false;

    app.use(require('./middleware/error'));
    app.use(require('./middleware/logger'));
    app.use(files(__dirname+'/../client/dist'));
    app.use(require('./middleware/missing-file-catcher'));
    app.use(require('./routes/projects')(route));
    app.use(require('./routes/app')(route));

    app.on('error',function (err) {
        console.error(err.stack||err);
    });

    app.listen(process.env.PORT,function () {
        console.log('%s@%s started on %s in %s',pkg.name,pkg.version,process.env.PORT,process.env.NODE_ENV);
    });
}
