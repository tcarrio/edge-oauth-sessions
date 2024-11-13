export class Container {
	private static _instance: Container;
	static instance(): Container {
		return (Container._instance ??= new Container());
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private services: Map<string | symbol, any> = new Map();
}
