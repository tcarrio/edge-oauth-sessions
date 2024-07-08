import { z } from 'zod';
import { UserAuthenticationState } from '../../oauth/types';
import { SessionRepository } from '../../sessions/session-repository';
import { NeonConfig } from './config';
import { NeonService } from './service';

const DatabaseRecordSchema = z.object({
	access_token: z.string(),
	refresh_token: z.string(),
	id_token: z.string().optional(),
});

export class NeonSessionRepository implements SessionRepository {
	constructor(private readonly service: NeonService, private readonly config: NeonConfig) {}

	async findById(id: string): Promise<UserAuthenticationState | null> {
		const { rows } = await this.service.getClient().query(
			`select access_token, refresh_token, id_token
			from ${this.config.sessionsTable}
			where session_id = $1`,
			[id]
		);

		if (rows.length === 0) {
			return null;
		}

		const [nonValidatedData] = rows;

		const { success, data } = DatabaseRecordSchema.safeParse(nonValidatedData);

		if (!success) {
			console.error('A fatal error occurred in the structure of the database record!');

			return null;
		}

		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			idToken: data.id_token,
		};
	}
	async upsert(id: string, session: UserAuthenticationState): Promise<void> {
		const { accessToken, refreshToken, idToken } = session;

		await this.service.getClient().query(
			`insert into ${this.config.sessionsTable} (session_id, access_token, refresh_token, id_token)
			values ($1, $2, $3, $4)
			on conflict (session_id)
			do update set access_token = $2, refresh_token = $3, id_token = $4`,
			[id, accessToken, refreshToken, idToken]
		);
	}
	async delete(id: string): Promise<void> {
		await this.service.getClient().query(
			`delete from ${this.config.sessionsTable}
			where session_id = $1`,
			[id]
		);
	}
}
