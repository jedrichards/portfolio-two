angular.module('templates-mod',['home-tpl.html','project-tpl.html']);

angular.module('home-tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('home-tpl.html',
    '<h1>Home</h1>');
}]);

angular.module('project-tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('project-tpl.html',
    '<h1>Project</h1>');
}]);
