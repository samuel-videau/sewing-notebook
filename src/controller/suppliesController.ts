import { FastifyInstance } from 'fastify'
import {Supply} from "../schemas/types/supply";
import * as admin from 'firebase-admin';
import * as supplySchema from '../schemas/json/supply.json';

export async function suppliesController (fastify: FastifyInstance) {
  const supplyCollection = admin.firestore().collection('supply');

  fastify.route<{ Body: Supply }>({
    method: 'POST',
    url: '/',
    schema: {
      body: supplySchema,
      response: { 200: supplySchema }
    },
    handler: async (request, reply) => {
      const supply: Supply = request.body;
      await supplyCollection.add(supply);
      return reply.code(200).send(supply);
    }
  });
}
