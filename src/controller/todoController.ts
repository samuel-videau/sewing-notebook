import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as admin from 'firebase-admin';
import * as todoItemSchema from "../schemas/json/todo-item.json";

const todoItemIdSchema = {
    type: 'object',
    required: ['todoItemId'],
    properties: {
      todoItemId: { type: 'string' }
    }
}

export async function todoItemsController (fastify: FastifyInstance) {
    const todoItemCollection = admin.firestore().collection('project');

    fastify.route<{ Body: TodoItem }>({
      method: 'POST',
      url: '/',
      schema: {
        body: todoItemSchema,
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
      handler: async function (request, reply) {
        const supply: TodoItem = request.body;
        const res = await todoItemCollection.add(supply);
        return reply.code(200).send(res.id);
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
            const todoItems = await todoItemCollection.get();
            return todoItems.docs.map(todo => todo.data() as TodoItem);
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
          try {
            const todoItemId: string = (request.params as {supplyId: string}).supplyId
            const doc = await todoItemCollection.doc(todoItemId).get();
            return reply.code(200).send(JSON.stringify(doc.data() as TodoItem));
          } catch (e: any) {
            return reply.code(404).send('To-do item not found');
          }
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
          try {
            const { todoItemId } = request.params as { todoItemId: string };
            await todoItemCollection.doc(todoItemId).set(request.body);
            await reply.code(200).send();
          } catch (e: any) {
            return reply.code(404).send('To-do item not found');
          }
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'DELETE',
        url: '/:todoItemId',
        schema: {
            params: todoItemIdSchema
        },
        handler: async function (request, reply) {
          try {
            const { todoItemId } = request.params as { todoItemId: string };
            await todoItemCollection.doc(todoItemId).delete();

            await reply.code(200).send();
          } catch (e: any) {
            return reply.code(404).send('To-do item not found');
          }
        }
    });
  }
