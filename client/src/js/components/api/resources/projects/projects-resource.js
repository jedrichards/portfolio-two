angular.module('projects-resource',[])
    .factory('Project',function (API_BASE,$resource) {
        var Project = $resource('/api/projects/:id',{id: '@_id'});
        return Project;
    });
