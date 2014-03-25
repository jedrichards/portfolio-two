module.exports = empty;

function* empty (db) {
    var res = yield db.list();
    var rows = res[0].rows;
    if ( rows.length == 0 ) return console.log('Database was already empty');
    var docs = rows.map(function (row) {
        return {
            _id: row.id,
            _rev: row.value.rev,
            _deleted: true
        }
    });
    yield db.bulk({docs:docs});
    console.log('Database emptied, '+docs.length+' docs deleted');
}
