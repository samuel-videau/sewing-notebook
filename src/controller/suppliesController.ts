import { FastifyInstance } from 'fastify'
import {Supply} from "../schemas/types/supply";
import * as admin from 'firebase-admin';
import * as supplySchema from '../schemas/json/supply.json';
import * as updateSupplySchema from '../schemas/json/update-supply.json';
import * as idResponseSchema from '../schemas/json/id-response.json';

const suppliesParamsSchema = {
  type: 'object',
  required: ['supplyId'],
  properties: {
      supplyId: { type: 'string' }
  }
}

export async function suppliesController (fastify: FastifyInstance) {
  const supplyCollection = admin.firestore().collection('supply');
 
  fastify.route<{ Body: Supply }>({
    method: 'GET', 
    url: '/',
    schema: {
      description: 'Get the list of all supplies',
      tags: ['supply'],
      summary: 'Get all supplies',
      response: { 200: {
            description: 'Successful response',
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
      response: { 200: idResponseSchema}
    },
    handler: async (request, reply) => {
      const res = await supplyCollection.add(request.body);
      return reply.code(200).send(res.id);
    }
  });


  // TODO verify response properly
  fastify.route<{ Body: Supply }>({
    method: 'GET',
    url: '/:supplyId',
    schema: {
      params : suppliesParamsSchema,
      response: { 200: supplySchema }
      },
    handler: async (request, reply) => {
      try {
        const { supplyId } = request.params as { supplyId: string };
        const doc = await supplyCollection.doc(supplyId).get();
        if (!doc.data()) return reply.code(404).send('Supply not found');
        return reply.code(200).send(JSON.stringify(doc.data() as Supply));
      } catch (e: any) {
        return reply.code(500).send('Internal Error');
      }
    }
  });

  fastify.route<{ Body: Supply }>({
    method: 'PUT',
    url: '/:supplyId',
    schema: {
      body: updateSupplySchema,
      params: suppliesParamsSchema
      },
    handler: async (request, reply) => {
      try {
        const { supplyId } = request.params as { supplyId: string };
        await supplyCollection.doc(supplyId).update(request.body);
        await reply.code(200).send();
      } catch (e: any) {
        return reply.code(500).send('Internal Error');
      }
    }
  });

  fastify.route<{ Body: Supply }>({
    method: 'DELETE',
    url: '/:supplyId',
    schema: {
        params : suppliesParamsSchema
      },
    handler: async function (request, reply) {
      try {
        const { supplyId } = request.params as { supplyId: string };
        await supplyCollection.doc(supplyId).delete();
        await reply.code(200).send();
      } catch (e: any) {
        return reply.code(500).send('Internal Error');
      }
    }
});

}
