var send = require('koa-send');
var pathToRegexp = require('path-to-regexp');

module.exports = app;

var frontendRoutes = [
    '/',
    '/projects/:id'
];

frontendRoutes.forEach(function (route,index) {
    frontendRoutes[index] = pathToRegexp(route);
});

function app (route) {
    return route.get('*',function* () {
        var isFrontEndRoute;
        var self = this;
        frontendRoutes.forEach(function (route) {
                isFrontEndRoute = route.exec(self.path);
        });
        if ( isFrontEndRoute ) {
            yield send(this,'index.html',{root:this.app.staticFiles});
        } else {
            this.status = 404;
        }
    });
}
