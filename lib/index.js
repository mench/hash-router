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
var EVENTS = Symbol('events');
var LISTENER = Symbol('listener');
var Emitter = (function () {
    function Emitter() {
    }
    Emitter.prototype.on = function (event, handler, options) {
        if (options === void 0) { options = {}; }
        var events = this[EVENTS];
        if (!events) {
            events = this[EVENTS] = Object.create(null);
        }
        var listeners = events[event];
        if (!listeners) {
            events[event] = [handler];
        }
        else {
            listeners.push(handler);
        }
        handler[LISTENER] = options;
    };
    Emitter.prototype.once = function (event, handler, options) {
        if (options === void 0) { options = {}; }
        options.once = true;
        this.on(event, handler, options);
    };
    Emitter.prototype.off = function (event, handler) {
        var events = this[EVENTS];
        if (events) {
            if (!handler) {
                delete events[event];
                return;
            }
            var listeners = events[event];
            if (listeners) {
                events[event] = listeners = listeners.filter(function (l) {
                    if (handler == l) {
                        delete handler[LISTENER];
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                if (listeners.length == 0) {
                    delete events[event];
                }
            }
        }
        else {
            delete this[EVENTS];
        }
    };
    Emitter.prototype.emit = function (event) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var events = this[EVENTS];
        if (events) {
            var listeners = events[event];
            if (listeners) {
                return listeners.map(function (l) {
                    var options = l[LISTENER];
                    if (options) {
                        if (options.once) {
                            _this.off(event, l);
                        }
                        return l.apply(options.target, args);
                    }
                    else {
                        return l.apply(void 0, args);
                    }
                });
            }
        }
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
        for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
            var route_1 = _a[_i];
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