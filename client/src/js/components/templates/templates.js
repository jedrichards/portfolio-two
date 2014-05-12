angular.module('templates',['home.html','project.html','project-list.html']);

angular.module('home.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('home.html',
    '<h1>Hi, I\'m Jed. A London based web developer specialising in JavaScript, Node.JS, HTML5 and CSS3.</h1><p>I have experience with contemporary frontend technologies such as AngularJS, Backbone+Marionette, RequireJS, Grunt/Gulp build automation and REST/Express Node.JS web apps.</p><ng-include src="\'project-list.html\'"></ng-include><h2>Activity</h2>');
}]);

angular.module('project.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('project.html',
    '<h1>Project</h1>');
}]);

angular.module('project-list.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('project-list.html',
    '<div ng-controller="ProjectListCtrl"><h2>Projects</h2><ul class="list"><li ng-repeat="project in projects">{{project.timestamp}} {{project.name}} {{project.description}}</li></ul></div>');
}]);
