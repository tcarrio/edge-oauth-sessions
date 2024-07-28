import type { EnumConstType } from "@eos/domain/open-id-connect/types";

export interface HttpClient {
	get<T>(path: string, options?: HttpOptions): Promise<HttpResponse<T>>;
	post<T>(
		path: string,
		data: any,
		options?: HttpOptions,
	): Promise<HttpResponse<T>>;
	patch<T>(
		path: string,
		data: any,
		options?: HttpOptions,
	): Promise<HttpResponse<T>>;
	put<T>(
		path: string,
		data: any,
		options?: HttpOptions,
	): Promise<HttpResponse<T>>;
	delete<T>(path: string, options?: HttpOptions): Promise<HttpResponse<T>>;
	request<T>(
		method: HttpMethodType,
		path: string,
		options?: HttpOptions,
	): Promise<HttpResponse<T>>;
}

export type HttpMethodType = EnumConstType<typeof HttpMethod>;
export const HttpMethod = {
	GET: "GET",
	POST: "POST",
	PATCH: "PATCH",
	PUT: "PUT",
	DELETE: "DELETE",
} as const;

export type HttpHeaders = Record<string, string>;

export interface HttpOptions {
	/** The body of the http request */
	body?: any;
	/** An object portraying the request's headers. */
	headers?: HttpHeaders;
	/** A number indicating whether request follows redirects and how many at a maximum to follow */
	followRedirects?: number;
	/** A string indicating what type of response to support when interacting with the data */
	responseType?: ResponseFormatType;
}

export type ResponseFormatType = EnumConstType<typeof ResponseFormat>;
export const ResponseFormat = {
	JSON: "json",
	Text: "text",
	XML: "xml",
	Infer: "infer",
	Ignore: "ignore",
} as const;

export interface HttpResponse<T> {
	readonly ok: boolean;
	readonly status: number;
	readonly headers: HttpHeaders;
	data(): Promise<T>;
}

export class HttpResponse<T> implements HttpResponse<T> {
	public constructor(
		public readonly ok: boolean,
		public readonly status: number,
		public readonly headers: HttpHeaders,
		private readonly textData: string,
		private readonly dataFormat: ResponseFormatType,
	) {}

	public async data(): Promise<T> {
		let { dataFormat } = this;
		if (dataFormat === ResponseFormat.Infer) {
			dataFormat = this.inferDataFormat(this.headers);
		}

		switch (dataFormat) {
			case ResponseFormat.JSON:
				return JSON.parse(this.textData);
			case ResponseFormat.Text:
				return this.textData as unknown as T;
			case ResponseFormat.XML:
				throw new Error("Not implemented");
			default:
				return null as T;
		}
	}

	private inferDataFormat(headers: HttpHeaders): ResponseFormatType {
		const contentType = headers["content-type"];
		if (!contentType) {
			return ResponseFormat.Ignore;
		}

		if (contentType.includes("application/json")) {
			return ResponseFormat.JSON;
		}
		if (contentType.includes("application/xml")) {
			return ResponseFormat.XML;
		}
		if (contentType.includes("text/plain")) {
			return ResponseFormat.Text;
		}

		return ResponseFormat.Ignore;
	}
}
