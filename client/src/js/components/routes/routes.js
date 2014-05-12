angular.module('routes',[
    'ngRoute'
])
    .config(function ($routeProvider,$locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/project/:id',{
                templateUrl: 'project.html'
            })
            .otherwise({
                templateUrl: 'home.html'
            });
    });
