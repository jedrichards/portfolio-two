/**
 * Error handling middleware. Catches any errors thrown in downstream generator
 * middleware and emits the error on the app instance.
 */

module.exports = error;

function* error (next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.status || 500;
        this.body = err.message || require('http').STATUS_CODES[this.status];
        this.app.emit('error',err,this);
    }
}
