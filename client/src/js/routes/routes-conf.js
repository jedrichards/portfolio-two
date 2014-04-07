angular.module('routes-mod')
    .config(function ($routeProvider,$locationProvider) {

        'use strict';

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/project/:id',{
                templateUrl: 'project-tpl.html'
            })
            .otherwise({
                templateUrl: 'home-tpl.html'
            });
    });
