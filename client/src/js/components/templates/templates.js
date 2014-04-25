angular.module('templates',['home.html','project.html']);

angular.module('home.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('home.html',
    '<h1>Hi, I\'m Jed. A London based web developer specialising in JavaScript, Node.JS, HTML5 and CSS3.</h1><p>I have experience with contemporary frontend technologies such as AngularJS, Backbone+Marionette, RequireJS, Grunt/Gulp build automation and REST/Express Node.JS web apps.</p><h2>Links</h2><h2>Work</h2><h2>Activity</h2>');
}]);

angular.module('project.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('project.html',
    '<h1>Project</h1>');
}]);
