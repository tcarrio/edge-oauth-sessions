import { Repository } from "../@types/repository";
import { Jwks } from "../jwt/jwks";

export class JwksRepository implements Repository<Jwks>{
	constructor(private readonly jwksUri: string) {}

	get(): Promise<Jwks> {
		return Jwks.fromJwksUri(this.jwksUri);
	}
}
