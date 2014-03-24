var koa = require('koa');
var static = require('koa-static');
var route = require('koa-route');
var nano = require('nano')(process.env.DB_URI);
var conano = require('co-nano');
var db = nano.use(process.env.DB_NAME);
var dbAction = process.argv[2];
var app;

if ( dbAction ) {
    require('./db/manage/'+dbAction)(nano,db,function (err,res) {
        if ( err ) return console.error(err);
        console.log(res);
    });
} else {
    initServer();
}

function initServer () {
    app = koa();

    app.outputErrors = false;

    app.use(require('./middleware/error'));
    app.use(require('./middleware/logger'));
    app.use(static(__dirname+'/../client/dist'));
    app.use(require('./middleware/missing-file-catcher'));
    app.use(require('./routes/app')(route));

    app.on('error',function (err) {
        console.error(err.stack||err);
    });

    app.listen(process.env.PORT,function () {
        console.log('Server started on',process.env.PORT,'in',process.env.NODE_ENV);
    });
}
