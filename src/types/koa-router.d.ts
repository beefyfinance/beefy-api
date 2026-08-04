declare module 'koa-router' {
  import type { DefaultContext, DefaultState, Middleware } from 'koa';

  type RouterOptions = {
    prefix?: string;
    methods?: string[];
    routerPath?: string;
    sensitive?: boolean;
    strict?: boolean;
  };

  type AllowedMethodsOptions = {
    throw?: boolean;
    notImplemented?: () => unknown;
    methodNotAllowed?: () => unknown;
  };

  type RouterParamContext = {
    params: Record<string, string>;
    routerName?: string;
    routerPath?: string;
  };

  type RouterMiddleware = Middleware<DefaultState, DefaultContext & RouterParamContext>;

  type RouteRegistrar = (path: string | RegExp | Array<string | RegExp>, ...middleware: RouterMiddleware[]) => Router;

  class Router {
    constructor(options?: RouterOptions);
    get: RouteRegistrar;
    post: RouteRegistrar;
    put: RouteRegistrar;
    patch: RouteRegistrar;
    delete: RouteRegistrar;
    del: RouteRegistrar;
    head: RouteRegistrar;
    options: RouteRegistrar;
    all: RouteRegistrar;
    use(...middleware: RouterMiddleware[]): Router;
    use(path: string | string[], ...middleware: RouterMiddleware[]): Router;
    prefix(prefix: string): Router;
    redirect(source: string, destination: string, code?: number): Router;
    routes(): Middleware;
    middleware(): Middleware;
    allowedMethods(options?: AllowedMethodsOptions): Middleware;
    url(name: string, ...params: unknown[]): string | Error;
  }

  export default Router;
}
