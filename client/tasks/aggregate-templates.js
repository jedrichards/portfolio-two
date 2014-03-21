var through = require('through2');
var util = require('util');

module.exports = function (moduleName) {

    stream = through.obj(function (file,enc,cb) {
        var templates = file.contents.toString().match(/^angular\.module\('(.*?)'/gm);
        templates.forEach(function (template,index) {
            template = template.replace(/angular.module\(/g,'');
            templates[index] = template;
        });
        var mod = util.format('angular.module(\'%s\',[%s]);\n\n',moduleName,templates.join(','));
        file.contents = Buffer.concat([new Buffer(mod),file.contents]);
        this.push(file);
        cb();
    });

    return stream;
}
