---
outline: deep
---

# Architecture

A high-level view of the architecture that portrays the various components:

TODO link image

## Overview

The components of the EOS architecture can be broken down into:

1. OAuth Envoy
2. OAuth Proxy

### OAuth Envoy

This component of the system deals largely with the OAuth user experience; routes like `/login` and `/callback` which facilitate the OAuth flow for traditional web server applications so that users can delegate access to the edge functions.

### OAuth Proxy

Once an auth session exists for the user, their delegated access needs to be assured in all requests so long as they are authenticated. This is the job of the Proxy component: Attach a valid access token for HTTP requests from existing web sessions. The access token is passed in the downstream, proxied HTTP request thus providing the necessary *authentication* mechanisms for resource servers to act upon.

