/**
 * Created by pepelu on 2016/4/20.
 */

var BOOLEAN = 'boolean';
var FUNCTION = 'function';
var Stream = require('stream');
var ReadStream = require('fs').ReadStream;
var NUMBER = 'number';

function onFinished(msg, listener) {
    if (isFinished(msg) !== false) {
        setImmediate(listener, null, msg);
        return msg;
    }
    attachListener(msg, listener);
    return msg;
}

function isFinished(msg) {

    var socket = msg.socket;

    // OutgoingMessage
    if (typeof msg.finished === BOOLEAN)
        return Boolean(msg.finished || (socket && !socket.writable));

    // IncomingMessage
    if (typeof msg.complete === BOOLEAN)
        return Boolean(msg.upgrade || !socket || !socket.readable || (msg.complete && !msg.readable))

    // don't know
    return;
}

function destroyStream(stream) {
    if (stream instanceof ReadStream) {
        stream.destroy();
        if (typeof(stream.close) !== FUNCTION)
            return stream;
        stream.on('open', function() {
            if (typeof(this.fd) === NUMBER)
                this.close();
        });
        return stream;
    }
    if (!(stream instanceof Stream))
        return stream;
    if (typeof(stream.destroy) === FUNCTION)
        stream.destroy();
    return stream;
}

function attachListener(msg, listener) {
    var attached = msg.__onFinished;

    // create a private single listener with queue
    if (!attached || !attached.queue) {
        attached = msg.__onFinished = createListener(msg);
        attachFinishedListener(msg, attached);
    }

    attached.queue.push(listener);
}

function createListener(msg) {
    function listener(err) {
        if (msg.__onFinished === listener)
            msg.__onFinished = null;
        if (!listener.queue)
            return;
        var queue = listener.queue;
        listener.queue = null;
        for (var i = 0, length = queue.length; i < length; i++)
            queue[i](err, msg);
    }
    listener.queue = [];
    return listener;
}

function attachFinishedListener(msg, callback) {
    var eeMsg;
    var eeSocket;
    var finished = false;

    function onFinish(error) {
        eeMsg.cancel();
        eeSocket.cancel();
        finished = true;
        callback(error);
    }

    // finished on first message event
    eeMsg = eeSocket = first([[msg, 'end', 'finish']], onFinish);

    function onSocket(socket) {
        // remove listener
        msg.removeListener('socket', onSocket);

        if (finished || eeMsg !== eeSocket)
            return;

        // finished on first socket event
        eeSocket = first([[socket, 'error', 'close']], onFinish);
    }

    // socket already assigned
    if (msg.socket) {
        onSocket(msg.socket);
        return;
    }

    // wait for socket to be assigned
    msg.on('socket', onSocket);

    // node.js 0.8 patch
    if (msg.socket === undefined)
        patchAssignSocket(msg, onSocket);
}

function patchAssignSocket(res, callback) {
    var assignSocket = res.assignSocket;
    if (typeof(assignSocket) !== FUNCTION)
        return;
    // res.on('socket', callback) is broken in 0.8
    res.assignSocket = function _assignSocket(socket) {
        assignSocket.call(this, socket);
        callback(socket);
    };
}

function first(stuff, done) {
    var cleanups = [];
    for (var i = 0, il = stuff.length; i < il; i++) {
        var arr = stuff[i];
        var ee = arr[0];
        for (var j = 1, jl = arr.length; j < jl; j++) {
            var event = arr[j];
            var fn = listener(event, callback);
            ee.on(event, fn);
            cleanups.push({ ee: ee, event: event, fn: fn });
        }
    }

    function callback() {
        cleanup();
        done.apply(null, arguments);
    }

    function cleanup() {
        var x;
        for (var i = 0, length = cleanups.length; i < length; i++) {
            x = cleanups[i];
            x.ee.removeListener(x.event, x.fn);
        }
    }

    function thunk(fn) {
        done = fn;
    }

    thunk.cancel = cleanup;
    return thunk;
}

function listener(event, done) {
    return function(arg1) {
        var args = new Array(arguments.length);
        var ee = this;
        var err = event === 'error' ? arg1 : null;

        // copy args to prevent arguments escaping scope
        for (var i = 0; i < args.length; i++)
            args[i] = arguments[i];
        done(err, ee, event, args);
    }
}

exports.destroyStream = destroyStream;
exports.onFinished = onFinished;