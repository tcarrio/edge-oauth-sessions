import type { FetchHttpClientConfig } from './fetch-config';
import { type HttpHeaders, type HttpResponse, HttpResponseImpl, ResponseFormat } from './http-client';

export class FetchResponseMapper {
	constructor(private readonly config: FetchHttpClientConfig) {}

	async toHttpResponse<T>(response: Response): Promise<HttpResponse<T>> {
		return new HttpResponseImpl(
			response.ok,
			response.status,
			this.toHttpHeaders(response.headers),
			await response.text(),
			this.config.responseFormat ?? ResponseFormat.Infer,
		);
	}

	toHttpHeaders(headers: Headers): HttpHeaders {
		return [...headers.entries()].reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as HttpHeaders);
	}
}
