import { ResponseFormat, type ResponseFormatType } from "./http-client";

const FETCH_DEFAULTS: FetchHttpClientConfig = {
	baseUrl: "",
	followRedirects: 0,
	responseFormat: "infer",
} as const;

export class FetchHttpClientConfig {
	public constructor(
		public readonly baseUrl: string,
		public readonly followRedirects: number = 0,
		public readonly responseFormat: ResponseFormatType = ResponseFormat.Infer,
	) {}

	static default() {
		return new FetchHttpClientConfig(
			FETCH_DEFAULTS.baseUrl,
			FETCH_DEFAULTS.followRedirects,
			FETCH_DEFAULTS.responseFormat,
		);
	}
}
