var koa = require('koa');
var koaStatic = require('koa-static');
var app = koa();

app.use(koaStatic(__dirname+'/../client/src'));
app.listen(process.env.PORT,function () {
	console.log("Server started on",process.env.PORT)
});
