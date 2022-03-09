import {FastifyInstance} from "fastify";
import * as userSchema from "../schemas/json/user.json";
import {logError} from "../bin/logger";
import {error, ERROR_INTERNAL} from "../bin/utils/error-messages";
import {User} from "../schemas/types/user";
import {insertUser} from "../bin/DB/users.table";
import {generateJWT} from "../bin/json-web-token";
import {JWT_VALIDITY_TIME} from "../environment/config";

export async function usersController (fastify: FastifyInstance) {

  fastify.route<{ Body: User }>({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create a user',
      tags: ['user'],
      summary: 'Create a user',
      body: userSchema,
    },
    handler: async (request, reply) => {
      try {
        const user: User = request.body;
        const userId = await insertUser(user.email, user.password);
        const jwt: string = generateJWT(userId);

        return reply.code(200).send({
          message: 'The account has been created',
          userId: userId,
          jwt: {
            validity: JWT_VALIDITY_TIME.toString() + 'h',
            token: jwt
          }
        })
      } catch (e) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

}