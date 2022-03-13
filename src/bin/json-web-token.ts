import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../environment/endpoints';
import {FastifyReply, FastifyRequest} from 'fastify';
import {error, ERROR_JWT_EXPIRED, ERROR_NO_JWT_TOKEN, ERROR_UNAUTHORIZED} from './utils/error-messages';
import {JWT_VALIDITY_TIME} from "../environment/config";
import {queryProjectAuth} from "./DB/project-auth.table";
import {logError} from "./logger";

export interface JWTPayload {
  userId: string,
  iat: number,
  exp: number
}

export function generateJWT(userId: string): string {
	return  jwt.sign({
		userId
	}, JWT_SECRET, {expiresIn: JWT_VALIDITY_TIME.toString() + 'h'});
}

export async function verifyJWT(req: FastifyRequest, res: FastifyReply, projectId?: string): Promise<string> {
	let payload: JWTPayload;
	if (!req.headers.authorization) return res.code(401).send(error(401, ERROR_NO_JWT_TOKEN));
	try {
		payload = jwt.verify(req.headers.authorization?.split(' ')[1], JWT_SECRET) as JWTPayload;
	} catch (e) {
		logError(e);
		return res.code(401).send(error(401, ERROR_JWT_EXPIRED));
	}
	if (projectId) {
		try  {
			const projectAuth = await queryProjectAuth(payload.userId, projectId);
			if (!projectAuth) {
				return res.code(403).send(error(403, ERROR_UNAUTHORIZED));
			}
		} catch (e) {
			return res.code(403).send(error(403, ERROR_UNAUTHORIZED));
		}
	}
	return payload.userId;
}
