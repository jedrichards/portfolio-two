angular.module('api',[
    'ngResource',
    'projects-resource',
    'api-path-interceptor'
])
    .constant('API_BASE','/api/');
