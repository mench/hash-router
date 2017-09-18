"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Emitter = (function () {
    function Emitter() {
    }
    Emitter.prototype.on = function (event, fn) {
        this._callbacks = this._callbacks || {};
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        this._callbacks[event].push(fn);
        return this;
    };
    Emitter.prototype.emit = function (event) {
        var args = [];
        for (var _a = 1; _a < arguments.length; _a++) {
            args[_a - 1] = arguments[_a];
        }
        var callback, callbacks, _i, _len;
        this._callbacks = this._callbacks || {};
        callbacks = this._callbacks[event];
        if (callbacks) {
            for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
                callback = callbacks[_i];
                callback.apply(this, args);
            }
        }
        return this;
    };
    Emitter.prototype.off = function (event, fn) {
        var callback, callbacks, i, _i, _len;
        if (!this._callbacks || arguments.length === 0) {
            this._callbacks = {};
            return this;
        }
        callbacks = this._callbacks[event];
        if (!callbacks) {
            return this;
        }
        if (arguments.length === 1) {
            delete this._callbacks[event];
            return this;
        }
        for (i = _i = 0, _len = callbacks.length; _i < _len; i = ++_i) {
            callback = callbacks[i];
            if (callback === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }
        return this;
    };
    return Emitter;
}());
exports.Emitter = Emitter;
var Route = (function () {
    function Route(path) {
        this.path = path;
        this.keys = [];
        this.params = {};
        this.regex = Route.pathToRegexp(this.path, this.keys, false, false);
    }
    Route.pathToRegexp = function (path, keys, sensitive, strict) {
        if (path instanceof RegExp)
            return path;
        if (path instanceof Array)
            path = '(' + path.join('|') + ')';
        path = path
            .concat(strict ? '' : '/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/\+/g, '__plus__')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
            keys.push({ name: key, optional: !!optional });
            slash = slash || '';
            return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
        })
            .replace(/([\/.])/g, '\\$1')
            .replace(/__plus__/g, '(.+)')
            .replace(/\*/g, '(.*)');
        return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    };
    Route.prototype.match = function (path, params) {
        var m = this.regex.exec(path);
        if (!m)
            return false;
        for (var i = 1, len = m.length; i < len; ++i) {
            var key = this.keys[i - 1];
            var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];
            if (key) {
                this.params[key.name] = val;
            }
            params.push(val);
        }
        return true;
    };
    return Route;
}());
exports.Route = Route;
var Router = (function (_super) {
    __extends(Router, _super);
    function Router() {
        var _this = _super.call(this) || this;
        _this.routes = [];
        _this.onHashChange = function () {
            _this.handle(Router.getHash());
        };
        if (window.addEventListener) {
            window.addEventListener('hashchange', _this.onHashChange, false);
        }
        else {
            window.attachEvent('onhashchange', _this.onHashChange);
        }
        _this.on('start', _this.onHashChange);
        return _this;
    }
    Router.getHash = function () {
        return window.location.hash.substring(1);
    };
    Object.defineProperty(Router, "default", {
        get: function () {
            return Object.defineProperty(this, 'default', {
                value: new Router()
            }).default;
        },
        enumerable: true,
        configurable: true
    });
    Router.start = function () {
        Router.default.emit('start');
    };
    Router.route = function (path, handler) {
        if (handler === void 0) { handler = function () { }; }
        return Router.default.register(path, handler);
    };
    Router.navigate = function (path) {
        window.location.hash = path;
    };
    Router.prototype.register = function (path, handler) {
        if (handler === void 0) { handler = function () { }; }
        var route = new Route(path);
        this.routes.push(route);
        var listener = function (params, route) {
            return handler.apply(route, params);
        };
        this.on(path, listener);
    };
    Router.prototype.handle = function (url) {
        for (var _a = 0, _b = this.routes; _a < _b.length; _a++) {
            var route_1 = _b[_a];
            var params = [];
            if (route_1.match(url, params)) {
                this.emit(route_1.path, params, route_1);
                break;
            }
        }
    };
    return Router;
}(Emitter));
exports.Router = Router;
function route(path, handler) {
    return Router.route(path, handler);
}
exports.route = route;
//# sourceMappingURL=index.js.map