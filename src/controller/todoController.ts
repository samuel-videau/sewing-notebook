import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";

import * as todoItemSchema from "../schemas/json/todo-item.json";

const todoItemIdSchema = {
    type: 'object',
    properties: {
        todoItemId: { type: 'number' }
    }
}

export async function todoItemsController (fastify: FastifyInstance) {
    fastify.route<{ Body: TodoItem }>({
      method: 'POST',
      url: '/',
      schema: {
        body: todoItemSchema,
        response: { 200: todoItemSchema },
      },
      handler: async function (request, reply) {
      }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'GET',
        url: '/',
        handler: async function (request, reply) {
        }
      });

    fastify.route<{ Body: TodoItem }>({
        method: 'GET',
        url: '/:todoItemId',
        schema: {
            response: { 200: todoItemSchema },
            params: todoItemIdSchema
          },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'PUT',
        url: '/:todoItemId',
        schema: {
            body: todoItemSchema,
            params: todoItemIdSchema
          },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'DELETE',
        url: '/:todoItemId',
        schema: {
            params: todoItemIdSchema
        },
        handler: async function (request, reply) {
        }
    });
  }
