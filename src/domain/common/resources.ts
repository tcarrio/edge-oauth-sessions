export type Resource = {};

export interface PreparableResource extends Resource {
	prepare(): Promise<void>;
}

export class AssuredResources {
	static async prepare(...resources: PreparableResource[]): Promise<void> {
		await Promise.all(resources.map((res) => res.prepare()));
	}
}
