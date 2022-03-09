import {FastifyInstance} from "fastify";
import * as userSchema from "../schemas/json/user.json";
import {logError} from "../bin/logger";
import {error, ERROR_INCORRECT_CREDENTIALS, ERROR_INTERNAL, ERROR_USER_NOT_FOUND} from "../bin/utils/error-messages";
import {User} from "../schemas/types/user";
import {queryUser} from "../bin/DB/users.table";
import {generateJWT} from "../bin/json-web-token";
import {JWT_VALIDITY_TIME} from "../environment/config";

export async function authController (fastify: FastifyInstance) {

  fastify.route<{ Body: User }>({
    method: 'PUT',
    url: '/',
    schema: {
      description: 'Get a JWT token with email and password login',
      tags: ['user'],
      summary: 'Login to an account',
      body: userSchema,
    },
    handler: async (request, reply) => {
      try {
        const user: User = request.body;
        const userId = await queryUser(user.email, user.password);
        const jwt: string = generateJWT(userId);

        return reply.code(200).send({
          message: 'Successfully logged in',
          userId: userId,
          jwt: {
            validity: JWT_VALIDITY_TIME.toString() + 'h',
            token: jwt
          }
        })
      } catch (e) {
        logError(e);
        if (e === ERROR_USER_NOT_FOUND) return reply.code(403).send(error(403, ERROR_INCORRECT_CREDENTIALS));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

}
