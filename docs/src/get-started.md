---
outline: deep
---

# Getting Started

The project is composed of multiple components

1. Serverless functions
2. Service configuration
3. Infrastructure definitions
4. OpenID Connect provider

## Serverless functions

As the name implies, **edge**-oauth-sessions relies on execution as close to the client as possible, making use of serverless platforms.

> ℹ️ The project currently targets Cloudflare Workers, with aims to support additional providers down the line.

These serverless functions are comprised of the following capabilities to facilitate a typical web application:

1. Login route
2. Callback route
3. Logout route
4. Proxy routes

### Login

The initializer of a web application's login flow- this delegates to the [OpenID Connect provider] to start a traditional code exchange OAuth flow with the necessary scopes and parameters to facilitate an OIDC connection. The web application will want to open this URL directly, which will begin the redirection to the necessary resources in the user's browser.

### Callback

After the user has delegated their access to your OpenID Connect provider, it will now redirect them to the callback URL. This route receives a code along with other security and contextual parameters for the login flow.

The code is exchanged with the OAuth authorization server for the access token, refresh token, and an optional identity token.

With the success exchange, the client session is now created with the state stored to either the user's cookie storage using **secure, HTTP-only** access tokens (stateless mode) or opaque identifiers (stateful mode). How these are used and more importantly kept valid is part of the general *Proxy routes* logic.

### Logout

A user may want to terminate their session in your web application. This is where they will go to destroy their auth state in both their local browser (they cannot access **secure, HTTP-only** cookies on their own) and in the edge functions' persistence mechanism.

### Proxy

Since auth state is largely maintained in the edge functions, proxying requests allows us to ensure the validity and proper handling of tokens for all HTTP requests.

When the request comes in, EOS determines whether a valid auth session exists. If so, it will continue by checking whether the current access token is expired (or will be, shortly), and if so it triggers the refresh process with the OAuth authorization server. The new access token is injected into the downstream request, and state will updated so the web client has the latest necessary information.

In either strategy of sessions, the use of refresh tokens ensures the latest authentication is available during an HTTP request, with the cookie strategy's value being updated in responses back to the client for all HTTP requests.

## Service configuration

TODO

## Infrastructure definitions

TODO

## OpenID Connect provider

TODO


<!-- References -->

[OpenID Connect provider]: /openid-connect-provider
