export declare class Emitter {
    private _callbacks;
    on(event: any, fn: any): this;
    emit(event: any, ...args: any[]): this;
    off(event: any, fn?: any): this;
}
export declare class Route {
    private regex;
    private keys;
    params: any;
    path: string;
    static pathToRegexp(path: any, keys: any, sensitive: any, strict: any): RegExp;
    match(path: string, params: any): boolean;
    constructor(path: string);
}
export declare class Router extends Emitter {
    static getHash(): string;
    static readonly default: any;
    static start(): void;
    static route(path: any, handler?: Function): any;
    static navigate(path: string): void;
    private routes;
    register(path: any, handler?: () => void): void;
    handle(url: any): void;
    onHashChange: () => void;
    constructor();
}
export declare function route(path: any, handler: any): any;
