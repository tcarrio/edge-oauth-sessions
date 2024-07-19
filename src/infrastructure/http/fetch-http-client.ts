import { FetchHttpClientConfig } from './fetch-config';
import { FetchResponseMapper } from './fetch-response-mapper';
import {
	HttpClient,
	HttpHeaders,
	HttpMethod,
	HttpMethodType,
	HttpOptions,
	HttpResponse,
	ResponseFormat,
	ResponseFormatType,
} from './http-client';

export type BodylessHttpOptions = Omit<HttpOptions, 'body'>;

export class FetchHttpClient implements HttpClient {
	private readonly responseMapper: FetchResponseMapper;

	constructor(private readonly config: FetchHttpClientConfig) {
		this.responseMapper = new FetchResponseMapper(config);
	}

	async get<T>(path: string, options?: BodylessHttpOptions): Promise<HttpResponse<T>> {
		return this.request(HttpMethod.GET, path, options);
	}

	async post<T>(path: string, data: any, options?: BodylessHttpOptions): Promise<HttpResponse<T>> {
		return this.request(HttpMethod.POST, path, { ...options, body: data });
	}

	async patch<T>(path: string, data: any, options?: BodylessHttpOptions): Promise<HttpResponse<T>> {
		return this.request(HttpMethod.PATCH, path, { ...options, body: data });
	}

	async put<T>(path: string, data: any, options?: BodylessHttpOptions): Promise<HttpResponse<T>> {
		return this.request(HttpMethod.PUT, path, { ...options, body: data });
	}

	async delete<T>(path: string, options?: BodylessHttpOptions): Promise<HttpResponse<T>> {
		return this.request(HttpMethod.DELETE, path, options);
	}

	async request<T>(method: HttpMethodType, path: string, options: HttpOptions = {}): Promise<HttpResponse<T>> {
		return fetch(`${this.config.baseUrl}${path}`, {
			method,
			body: options?.body ? JSON.stringify(options.body) : undefined,
			headers: options?.headers,
			redirect: options?.followRedirects ? 'follow' : 'manual',
		}).then((res) => this.responseMapper.toHttpResponse(res as unknown as Response));
	}
}
