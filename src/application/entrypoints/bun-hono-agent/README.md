# bun-hono-agent

A NodeJS server powered by the Hono web framework.

> ℹ️ This server servers as a local proxy agent to simulate the flow of production deploys powered by Bun

## What is Hono

Hono is a web framework that aims to be agnostic to runtimes while building on web-native primitives.

It has support for Cloudflare Workers, NodeJS, AWS Lambda, Bun, Deno, and more.

With little to no changes necessary, a Hono application can be repurposed for an entirely separate runtime.

## How is this structured?

This application entrypoint is a wiring of various application and infrastructure layer components injected into our core business logic- in this case we are primarily concerned with OAuth 2.0, OpenID Connect 1.0, and web browser auth session management. Underlying state management utilizes configurable strategies such as auth providers (e.g. Auth0) and data sources like SQLite. This is accomplished using the local server as the OAuth Agent and Proxy, with data sources maintaining state from the browser request and fulfilling the auth session as necessary for downstream calls. This includes actions like token refreshing and access token injection for requests proxied downstream as well as serving as an OAuth Agent facilitating application login and logout functions.

## Configuration

Environment variables are necessary to configure the service. You will need the following variables (example values provided):

```
ROUTER_DOMAIN='localhost'
ROUTER_COOKIE_KEY='auth-session-id'
ROUTER_CALLBACK_PATH='/auth/callback'
ROUTER_LOGIN_PATH='/auth/login'
ROUTER_LOGOUT_PATH='/auth/logout'

JWKS_VALIDATION = false
JWKS_URI = "https://your-tenant.auth0.com/.well-known/jwks.json"
JWKS_CACHE_TIME_SECONDS = 600 # seconds

OAUTH_STRATEGY = "auth0"
OAUTH_REDIRECT_URI = "http://localhost/auth/callback"
OAUTH_CLIENT_ID = "client-id"
OAUTH_CLIENT_SECRET = "client-secret"
```