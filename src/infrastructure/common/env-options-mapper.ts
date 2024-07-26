import z from 'zod';

export const mapperForMapping = <Output extends object, S extends z.ZodSchema>(
	mapping: Record<keyof z.infer<S>, keyof Output>
) => (source: S extends z.ZodSchema<infer T> ? T : z.infer<S>): Output =>
	Object.keys(source)
		.reduce((target, sourceKey) =>
			({...target, [mapping[sourceKey]]: source[sourceKey]}),
		{} as Output,
	);