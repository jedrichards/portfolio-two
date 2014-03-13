module.exports = missingFileCatcher;

var types = ['jpg','css','js','html'];

function * missingFileCatcher (next) {
    var ext = this.path.split('.').pop();
    if ( types.indexOf(ext) > -1 ) {
        this.status = 'not found';
    }
}
