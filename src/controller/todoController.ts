import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as admin from 'firebase-admin';
import * as todoItemSchema from "../schemas/json/todo-item.json";

const todoItemIdSchema = {
    type: 'object',
    required: ['projectId'],
    properties: {
        projectId: { type: 'string' }
    }
}

export async function todoItemsController (fastify: FastifyInstance) {
    const projectCollection = admin.firestore().collection('project');

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
        schema: {
            response: { 200: {
                "type": "array",
                "items": todoItemSchema
              }
            }
          },
        handler: async function (request, reply) {
            const projects = await projectCollection.get();
            return projects.docs.map(project => project.data() as TodoItem);
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
