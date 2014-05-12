var koa = require('koa');
var files = require('koa-static');
var route = require('koa-route');
var co = require('co');
var nano = require('nano')(process.env.DB_URI);
var conano = require('co-nano')(nano);
var db = conano.use(process.env.DB_NAME);
var path = require('path');
var app;

if ( process.argv[2] ) {
    doDBActions();
} else {
    initServer();
}

function initServer () {
    app = koa();
    app.db = db;
    app.outputErrors = false;
    app.staticFiles = path.normalize(process.cwd()+process.env.STATIC_FILES);

    app.use(require('./middleware/error'));
    app.use(require('./middleware/logger'));
    app.use(require('./middleware/static-versioning'));
    app.use(files(app.staticFiles,{maxage:30*24*60*60*1000}));
    app.use(require('./middleware/missing-file-catcher'));

    app.use(require('./routes/project')(route));
    app.use(require('./routes/projects')(route));
    app.use(require('./routes/app')(route));
    
    app.on('error',function (err) {
        console.error(err.stack||err);
    });

    app.listen(process.env.PORT,function () {
        var pkg = require('./package.json');
        console.log('%s@%s started on %s in %s',pkg.name,pkg.version,process.env.PORT,process.env.NODE_ENV);
    });
}

function doDBActions () {
    co(function* () {
        var actions = process.argv[2].split(',');
        for ( var i=0; i<actions.length; i++ ) {
            var action = actions[i];
            yield require('./db/manage/'+action)(db);
        }
    })();
}
