/**
 * Adjusts request paths for JS and CSS assets such that an asset requested via
 * a path '/v1.2.3/js/foo.js' will be changed to '/js/foo.js' before the static
 * file serving middleware gets a chance to handle it. This enables aggressive
 * cache settings for static assets as long as the frontend code is able to
 * update its paths with the current app version.
 */

module.exports = staticVersioning;

var types = ['js','css'];

function* staticVersioning (next) {
    if ( this.method != 'GET' && this.method != 'HEAD' ) {
        yield next;
        return;
    }
    var ext = this.path.split('.').pop();
    if ( types.indexOf(ext) == -1 ) {
        yield next;
        return;
    }
    this.path = this.path.replace(/\/v\d+.\d+.\d+/,'');
    yield next;
}
