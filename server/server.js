var koa = require('koa');
var koaStatic = require('koa-static');
var koaRoute = require('koa-route');

var app = koa();

app.use(require('./middleware/logger'));
app.use(koaStatic(__dirname+'/../client/dist'));
app.use(require('./middleware/missing-file-catcher'));
app.use(require('./routes/app')(koaRoute));

app.on('error',function (err) {
    console.error(err);
});

app.listen(process.env.PORT,function () {
    console.log('Server started on',process.env.PORT,'in',process.env.NODE_ENV);
});
