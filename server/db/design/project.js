module.exports = {
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
