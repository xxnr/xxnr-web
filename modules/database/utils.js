/**
 * Created by pepelu on 2016/4/13.
 */
var os = require('os');
var path = require('path');
var isWindows = os.platform().substring(0, 3).toLowerCase() === 'win';
var directory = path.dirname(process.argv[1]);
var regexpPATH = /\\/g;

/*
 Combine path
 @arguments {String array}
 return {String}
 */
exports.combine = function() {
    var p;

    if (arguments[0][0] === '~') {
        arguments[0] = arguments[0].substring(1);
        p = '';

        for (var i = 0, length = arguments.length; i < length; i++) {
            var v = arguments[i];
            if (v)
                p += (v[0] !== '/' ? (p[p.length - 1] !== '/' ? '/' : '') : '') + v;
        }

        if (framework.isWindows)
            return p.replace(regexpPATH, '/');

        return p;
    }

    p = directory;

    for (var i = 0, length = arguments.length; i < length; i++) {
        var v = arguments[i];
        if (v)
            p += (v[0] !== '/' ? (p[p.length - 1] !== '/' ? '/' : '') : '') + v;
    }

    if (isWindows)
        return p.replace(regexpPATH, '/');

    return p;
};