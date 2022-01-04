import { FastifyInstance } from 'fastify'
import {Supply} from "../schemas/types/supply";

import * as supplySchema from '../schemas/json/supply.json';

export function suppliesController (fastify: FastifyInstance) {
  fastify.route<{ Body: Supply }>({
    method: 'POST',
    url: '/',
    schema: {
      body: supplySchema,
      // response: { 200: supplySchema }
    },
    handler: async function (request, reply) {
    }
  });
}
