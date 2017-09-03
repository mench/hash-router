const EVENTS:symbol = Symbol('events');
const LISTENER:symbol = Symbol('listener');

export class Emitter {
    public on(event:string,handler:Function,options:any={}):void{
        let events = this[EVENTS];
        if(!events){
            events = this[EVENTS] = Object.create(null);
        }
        let listeners = events[event];
        if(!listeners){
            events[event] = [handler];
        }else{
            listeners.push(handler);
        }
        handler[LISTENER]=options;
    }
    public once(event: string, handler:Function,options:any={}):void{
        options.once = true;
        this.on(event,handler,options);
    }
    public off(event?:string,handler?:Function):void{
        let events = this[EVENTS];
        if(events){
            if(!handler){
                delete events[event];
                return;
            }
            let listeners = events[event];
            if(listeners){
                events[event] = listeners = listeners.filter(l=>{
                    if(handler==l){
                        delete handler[LISTENER];
                        return false;
                    }else{
                        return true;
                    }
                });
                if(listeners.length==0){
                    delete events[event];
                }
            }
        }else{
            delete this[EVENTS];
        }
    }
    public emit(event:string,...args:any[]):any[]{
        let events = this[EVENTS];
        if(events){
            let listeners = events[event];
            if(listeners){
                return listeners.map(l=>{
                    let options = l[LISTENER];
                    if(options){
                        if(options.once){
                            this.off(event,l);
                        }
                        return l.apply(options.target,args);
                    }else{
                        return l.apply(void 0,args);
                    }
                });
            }
        }
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
