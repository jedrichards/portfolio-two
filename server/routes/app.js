var send = require('koa-send');

module.exports = app;

function app (route) {
    return route.get('*',function* () {
        yield send(this,'index.html',{root:__dirname+'/../../client/dist'});
    });
}
