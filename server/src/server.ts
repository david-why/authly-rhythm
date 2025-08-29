export interface ServerRoute<T extends string = string> {
  path: T
  method: Bun.RouterTypes.HTTPMethod
  handler: Bun.RouterTypes.RouteHandler<T>
}

type BunRoutesType = Record<
  string,
  {
    [K in Bun.RouterTypes.HTTPMethod]?: (
      req: Bun.BunRequest,
      server: Bun.Server,
    ) => Promise<Response> | Response
  }
>

export class HTTPError extends Error {
  constructor(
    public status: number,
    message?: string,
  ) {
    super(message)
    this.name = 'HTTPError'
  }
}

export class Server {
  private routes: ServerRoute[] = []

  private makeHandler<T extends string = string>(
    handler: Bun.RouterTypes.RouteHandler<T>,
  ): Bun.RouterTypes.RouteHandler<T> {
    return async (req: Bun.BunRequest, server: Bun.Server) => {
      try {
        const res = await handler(req, server)
        return res
      } catch (e) {
        if (e instanceof HTTPError) {
          return Response.json({ message: e.message }, { status: e.status })
        }
        console.error(`Error handling request ${req.method} ${req.url}`)
        console.error(e)
        return Response.json({ message: 'Internal server error' }, { status: 500 })
      }
    }
  }

  public addRoute<T extends string = string>(
    path: T,
    handler: Bun.RouterTypes.RouteHandler<T>,
    method: Bun.RouterTypes.HTTPMethod = 'GET',
  ) {
    this.routes.push({ path, method, handler: this.makeHandler(handler) })
  }

  public get<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'GET')
  }

  public post<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'POST')
  }

  public put<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'PUT')
  }

  public delete<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'DELETE')
  }

  public patch<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'PATCH')
  }

  public head<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'HEAD')
  }

  public options<T extends string = string>(path: T, handler: Bun.RouterTypes.RouteHandler<T>) {
    this.addRoute(path, handler, 'OPTIONS')
  }

  public serve(options: Partial<Bun.ServeOptions> = {}) {
    const routes: BunRoutesType = this.routes.reduce((acc, route) => {
      const { path, method, handler } = route
      if (!acc[path]) {
        acc[path] = {}
      }
      acc[path][method] = handler
      return acc
    }, {} as BunRoutesType)
    Bun.serve({ ...options, routes })
  }
}
