# @eos/cf-router

A Cloudflare worker powered by the Hono web framework.

> ℹ️ This worker is the primary development target for the Cloudflare Workers with support for auth state management.

## What is Hono

Hono is a web framework that aims to be agnostic to runtimes while building on web-native primitives.

It has support for Cloudflare Workers, NodeJS, AWS Lambda, Bun, Deno, and more.

With little to no changes necessary, a Hono application can be repurposed for an entirely separate runtime.

## How is this structured?

This application entrypoint is a wiring of various application and infrastructure layer components injected into our core business logic- in this case we are primarily concerned with OAuth 2.0, OpenID Connect 1.0, and web browser auth session management. Underlying state management utilizes configurable strategies such as Cloudflare Durable Objects, Workers KV, and more. This is accomplished using Cloudflare Workers as the OAuth Agent and Proxy, with this Worker detecting session state from the browser request and fulfilling the auth session as necessary. This includes actions like token refreshing and access token injection for requests proxied downstream as well as serving as an OAuth Agent facilitating application login and logout functions.
