export class Emitter {
    private _callbacks;
    on(event:string, fn:Function) {
        this._callbacks = this._callbacks || {};
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        this._callbacks[event].push(fn);
        return this;
    }
    emit(event:string,...args){
        let callback, callbacks, _i, _len;
        this._callbacks = this._callbacks || {};
        callbacks = this._callbacks[event];
        if (callbacks) {
            for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
                callback = callbacks[_i];
                callback.apply(this, args);
            }
        }
        return this;
    }
    off(event, fn?) {
        let callback, callbacks, i, _i, _len;
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
    }
}

export class Route {
    private regex:RegExp;
    private keys:any[];
    public  params:any;
    public  path:string;
    static pathToRegexp(path, keys, sensitive, strict) {
        if (path instanceof RegExp) return path;
        if (path instanceof Array) path = '(' + path.join('|') + ')';
        path = path
            .concat(strict ? '' : '/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/\+/g, '__plus__')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
                keys.push({ name: key, optional: !! optional });
                slash = slash || '';
                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/__plus__/g, '(.+)')
            .replace(/\*/g, '(.*)');
        return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    }
    match(path:string, params){
        let m = this.regex.exec(path);

        if (!m) return false;

        for (let i = 1, len = m.length; i < len; ++i) {
            let key = this.keys[i - 1];

            let val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

            if (key) {
                this.params[key.name] = val;
            }
            params.push(val);
        }

        return true;
    }
    constructor(path:string){
        this.path = path;
        this.keys = [];
        this.params = {};
        this.regex = Route.pathToRegexp(this.path, this.keys, false, false);
    }
}

export class Router extends Emitter{
    static getHash(){
        return window.location.hash.substring(1)
    }
    static get default(){
        return Object.defineProperty(this,'default',{
            value:new Router()
        }).default
    }
    static start(){
        Router.default.emit('start');
    }
    static route(path,handler:Function = ()=>{}){
        return Router.default.register(path,handler);
    }
    static navigate(path:string){
        window.location.hash = path;
    }
    private routes:Route[] = [];

    public register(path,handler = ()=>{}){
        let route = new Route(path);
        this.routes.push(route);
        let listener = function (params,route) {
            return handler.apply(route,params);
        };
        this.on(path,listener);
    }
    public handle(url){
        for(let route of this.routes){
            let params = [];
            if( route.match(url,params) ){
                this.emit(route.path,params,route);
                break;
            }
        }
    }
    onHashChange =()=>{
        this.handle(Router.getHash());
    };
    constructor(){
        super();

        if (window.addEventListener) {
            window.addEventListener('hashchange',  this.onHashChange, false);
        } else {
            (window as any).attachEvent('onhashchange',  this.onHashChange);
        }
        this.on('start',this.onHashChange);
    }
}

export function route(path,handler){
    return Router.route(path,handler);
}