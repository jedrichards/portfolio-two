angular.module('api-path-interceptor',[])
    .factory('apiPath',function ($q) {
        return {
            'request': function (config) {
                console.log(config);
                return config;
            }
        };
    });
