import { JSONWebKeySet, RemoteJWKSetOptions, createLocalJWKSet, createRemoteJWKSet } from "jose";

export type LocalJWKSet = ReturnType<typeof createLocalJWKSet>;
export type RemoteJWKSet = ReturnType<typeof createRemoteJWKSet>;

export type JWKSet = LocalJWKSet | RemoteJWKSet;

export function jwksSetFactory(localOrRemoteJwks: string|JSONWebKeySet, remoteOptions?: RemoteJWKSetOptions): LocalJWKSet|RemoteJWKSet {
	if (typeof localOrRemoteJwks === 'string') {
		return createRemoteJWKSet(new URL(localOrRemoteJwks), remoteOptions);
	}

	return createLocalJWKSet(localOrRemoteJwks);
}
