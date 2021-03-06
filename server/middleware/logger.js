/**
 * Request logging middleware. Outputs the HTTP method, url, status and response
 * time to stdout.
 */

module.exports = logger;

function* logger (next) {
    var start = Date.now();
    yield next;
    var ms = Date.now() - start;
    console.log('%s %s %s (%sms)',this.method,this.url,this.status,ms);
}
