import { FastifyInstance } from 'fastify'
import {Supply} from "../schemas/types/supply";
import * as supplySchema from '../schemas/json/supply.json';
import {logError} from "../bin/logger";
import {error, ERROR_INTERNAL, ERROR_SUPPLY_NOT_FOUND} from "../bin/utils/error-messages";
import {deleteSupply, editSupply, insertSupply, queryAllSupplies, querySupply} from "../bin/DB/supplies.table";

const suppliesParamsSchema = {
  type: 'object',
  required: ['supplyId'],
  properties: {
      supplyId: { type: 'string', description: "Id of the supply" }
  }
}

export async function suppliesController (fastify: FastifyInstance) {

  fastify.route<{ Body: Supply }>({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create a supply',
      tags: ['supply'],
      summary: 'Create a supply',
      body: supplySchema,
      response: { 200: supplySchema}
    },
    handler: async (request, reply) => {
      try {
        const supply: Supply = request.body;
        supply.id = await insertSupply(supply.name, supply.description, supply.quantity, supply.type, supply.color);
        return reply.code(200).send(supply);
      } catch (e) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

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
      const supplies = await queryAllSupplies();
      return reply.code(200).send(supplies);
    }
  });

  fastify.route<{ Body: Supply }>({
    method: 'GET',
    url: '/:supplyId',
    schema: {
      description: 'Get information about a specific supply',
      tags: ['supply'],
      summary: 'Get a specific supply',
      params : suppliesParamsSchema,
      response: { 200: supplySchema }
      },
    handler: async (request, reply) => {
      try {
        const { supplyId } = request.params as { supplyId: string };
        const supply = await querySupply(supplyId);
        if (!supply) return reply.code(404).send(error(404, ERROR_SUPPLY_NOT_FOUND));
        return reply.code(200).send(supply);
      } catch (e: any) {
        logError(e);
        return reply.code(500).send('Internal Error');
      }
    }
  });

  fastify.route<{ Body: Supply }>({
    method: 'PUT',
    url: '/:supplyId',
    schema: {
      description: 'Modify a specific supply',
      tags: ['supply'],
      summary: 'Modify information about a specific supply',
      body: supplySchema,
      params: suppliesParamsSchema
      },
    handler: async (request, reply) => {
      try {
        const { supplyId } = request.params as { supplyId: string };
        await editSupply(supplyId, request.body.name, request.body.description, request.body.quantity, request.body.type, request.body.color)
        await reply.code(200).send();
      } catch (e: any) {
        logError(e);
        if (e === ERROR_SUPPLY_NOT_FOUND) return reply.code(404).send(error(404, ERROR_SUPPLY_NOT_FOUND));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });

  fastify.route<{ Body: Supply }>({
    method: 'DELETE',
    url: '/:supplyId',
    schema: {
        description: 'Delete a specific supply',
        tags: ['supply'],
        summary: 'Delete a specific supply',
        params : suppliesParamsSchema
      },
    handler: async function (request, reply) {
      try {
        const { supplyId } = request.params as { supplyId: string };
        await deleteSupply(supplyId);
        await reply.code(200).send();
      } catch (e: any) {
        logError(e);
        if (e === ERROR_SUPPLY_NOT_FOUND) return reply.code(404).send(error(404, ERROR_SUPPLY_NOT_FOUND));
        return reply.code(500).send('Internal Error');
      }
    }
});

}
