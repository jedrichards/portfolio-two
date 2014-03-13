var koa = require('koa');
var static = require('koa-static');
var route = require('koa-route');
var send = require('koa-send');

var app = koa();
app.name = require(__dirname+'/package.json').name;

app.use(require("./middleware/logger"));
app.use(static(__dirname+'/../client/src'));

app.use(route.get('*',function * () {
	yield send(this,'index.html',{root:__dirname+'/../client/src'});
}));

app.on('error',function (err) {
	console.log(err);
});

app.listen(process.env.PORT,function () {
	console.log('Server started on',process.env.PORT,'in',process.env.NODE_ENV);
});
