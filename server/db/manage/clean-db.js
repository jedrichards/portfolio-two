module.exports = cleanDb;

function cleanDb (nano,db,cb) {
    db.list({'include_docs':true},function (err,res) {
        if ( err ) return cb(err);
        if ( res.rows.length == 0 ) return cb(null,'Database was already empty');
        var docs = res.rows.map(function (row) {
            row.doc._deleted = true;
            return row.doc;
        });
        db.bulk({docs:docs},function (err) {
            if ( err ) return cb(err);
            cb(null,'Cleaned database');
        });
    });
}
