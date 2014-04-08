/**
 * Catches any requests for supported static filetypes that aren't present on
 * disk (and therefore weren't handled by the upstream static file serving
 * middleware) and responds with a 404. This is necessary because the last
 * downstream main app route will catch all surviving requests and respond with
 * the index.html file to support HTML5 pushState.
 */

module.exports = missingFileCatcher;

var types = ['jpg','png','css','js','html'];

function* missingFileCatcher (next) {
    var ext = this.path.split('.').pop();
    if ( types.indexOf(ext) > -1 ) {
        this.status = 404;
    } else {
        yield next;
    }
}
