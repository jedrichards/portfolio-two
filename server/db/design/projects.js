module.exports = {
    _id: '_design/projects',
    views: {
        projectsById: {
            map: function (doc) {
                if ( doc.type == 'project' ) {
                    emit(doc._id,doc);
                }
            }
        },
        projectsByDate: {
            map: function (doc) {
                if ( doc.type == 'project' ) {
                    var parts = doc.timestamp.split('/');
                    emit(new Date(parts[2],parts[1]-1,parts[0]).getTime(),doc);
                }
            }
        }
    }
}
