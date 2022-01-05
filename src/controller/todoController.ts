import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";

import * as todoItemSchema from "../schemas/json/todo-item.json";

export async function TodoItemsController (fastify: FastifyInstance) {
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
        url: '/:TodoItemId',
        schema: {
            response: { 200: todoItemSchema },
          },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'PUT',
        url: '/:TodoItemId',
        schema: {
            body: todoItemSchema,
          },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'DELETE',
        url: '/:TodoItemId',
        handler: async function (request, reply) {
        }
    });
  }
