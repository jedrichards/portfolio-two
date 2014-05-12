angular.module('project-list',[])
    .controller('ProjectListCtrl',function ($scope,Project) {
        $scope.projects = Project.query();
    });
