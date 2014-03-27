module.exports = {
    _id: '_design/project',
    views: {
        projectsById: {
            map: function (doc) {
                if ( doc.type == 'project' ) {
                    emit(doc._id,doc);
                }
            }
        }
    }
}
