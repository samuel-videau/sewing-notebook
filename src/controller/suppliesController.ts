import { FastifyInstance } from 'fastify'
import {Supply} from "../schemas/types/supply";
import * as admin from 'firebase-admin';
import * as supplySchema from '../schemas/json/supply.json';

export async function suppliesController (fastify: FastifyInstance) {
  const supplyCollection = admin.firestore().collection('supply');



  fastify.route<{ Body: Supply }>({
    method: 'GET',
    url: '/',
    schema: {
      response: { 200: {
          "type": "array",
          "items": supplySchema
        }
      }
    },
    handler: async (request, reply) => {
      const docs = await supplyCollection.get();
      const supplies: Supply[] = [];
      docs.forEach(doc => {
        supplies.push(doc.data() as Supply);
      });
      return reply.code(200).send(supplies);
    }
  });



  fastify.route<{ Body: Supply }>({
    method: 'POST',
    url: '/',
    schema: {
      body: supplySchema,
      response: { 200: {
          "type": "object",
          "required": ["id"],
          "additionalProperties": false,
          "properties": {
            "name": {"id": "string"}
          }
        }
      }
    },
    handler: async (request, reply) => {
      const supply: Supply = request.body;
      const res = await supplyCollection.add(supply);
      return reply.code(200).send(res.id);
    }
  });


  // TODO verify response properly
  fastify.route<{ Body: Supply }>({
    method: 'GET',
    url: '/:supplyId',
    schema: {
      response: { 200: supplySchema }
      },
    handler: async (request, reply) => {
      try {
        const supplyId: string = (request.params as {supplyId: string}).supplyId
        const doc = await supplyCollection.doc(supplyId).get();
        return reply.code(200).send(JSON.stringify(doc.data() as Supply));
      } catch (e: any) {
        return reply.code(404).send('Supply not found');
      }
    }
  });

  // fastify.route<{ Body: Supply }>({
  //   method: 'GET',
  //   url: '/',
  //   handler: async (request, reply) => {
  //     return reply.code(200).send('ok');
  //   }
  // });
}
