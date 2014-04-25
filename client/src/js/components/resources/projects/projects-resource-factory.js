angular.module('projects-resource')
    .factory('Project',function ($resource) {

        'use strict';

        var Project = $resource('/api/projects/:id',{id: '@_id'});
        return Project;
    });
