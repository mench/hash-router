export declare class Emitter {
    on(event: string, handler: Function, options?: any): void;
    once(event: string, handler: Function, options?: any): void;
    off(event?: string, handler?: Function): void;
    emit(event: string, ...args: any[]): any[];
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
