export class RouterConfig {
	constructor(
		public readonly cookieKey: string,
		public readonly callbackPath: string,
		public readonly loginPath: string,
		public readonly logoutPath: string,
	) {}
}
