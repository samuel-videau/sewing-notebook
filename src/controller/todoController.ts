import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as admin from 'firebase-admin';
import * as todoItemSchema from "../schemas/json/todo-item.json";
import * as idResponseSchema from '../schemas/json/id-response.json';

const projectParamsSchema = {
  type: 'object',
  required: ['projectId'],
  properties: {
    projectId: { type: 'string' }
  }
}

const todoItemIdSchema = {
    type: 'object',
    required: ['todoItemId'],
    properties: {
      todoItemId: { type: 'string', description: 'Id of the to-do item' }
    }
}

export async function todoItemsController (fastify: FastifyInstance) {
    const projectCollection = admin.firestore().collection('project');

    fastify.route<{ Body: TodoItem }>({
      method: 'POST',
      url: '/',
      schema: {
        description: 'Create a to-do item',
        tags: ['to-do'],
        summary: 'Create a to-do item',
        body: {todoItemSchema},
        params : projectParamsSchema,
        response: { 200: idResponseSchema}
      },
      handler: async function (request, reply) {
        const supply: TodoItem = request.body;
        const { projectId } = request.params as { projectId: string };

        const res = await projectCollection.doc(projectId).collection('todo').add(supply);
        return reply.code(200).send(res.id);
      }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'GET',
        url: '/',
        schema: {
            description: 'Get the list of all to-do items',
            tags: ['to-do'],
            summary: 'Get all to-do items',
          params : projectParamsSchema,
          response: { 200: {
                "type": "array",
                "items": todoItemSchema
              }
            }
          },
        handler: async function (request, reply) {
          const { projectId } = request.params as { projectId: string };
          const todoItems = await projectCollection.doc(projectId).collection('todo').get();
          return todoItems.docs.map(todo => {
            return {...todo.data() as TodoItem, id: todo.id}
          });
        }
      });
    //
    // fastify.route<{ Body: TodoItem }>({
    //     method: 'GET',
    //     url: '/:todoItemId',
    //     schema: {
    //         response: { 200: todoItemSchema },
    //         params: todoItemIdSchema
    //       },
    //     handler: async function (request, reply) {
    //       try {
    //         const todoItemId: string = (request.params as {supplyId: string}).supplyId
    //         const doc = await todoItemCollection.doc(todoItemId).get();
    //         return reply.code(200).send(JSON.stringify(doc.data() as TodoItem));
    //       } catch (e: any) {
    //         return reply.code(404).send('To-do item not found');
    //       }
    //     }
    // });
    //
    // fastify.route<{ Body: TodoItem }>({
    //     method: 'PUT',
    //     url: '/:todoItemId',
    //     schema: {
    //         body: todoItemSchema,
    //         params: todoItemIdSchema
    //       },
    //     handler: async function (request, reply) {
    //       try {
    //         const { todoItemId } = request.params as { todoItemId: string };
    //         await todoItemCollection.doc(todoItemId).set(request.body);
    //         await reply.code(200).send();
    //       } catch (e: any) {
    //         return reply.code(404).send('To-do item not found');
    //       }
    //     }
    // });
    //
    // fastify.route<{ Body: TodoItem }>({
    //     method: 'DELETE',
    //     url: '/:todoItemId',
    //     schema: {
    //         params: todoItemIdSchema
    //     },
    //     handler: async function (request, reply) {
    //       try {
    //         const { todoItemId } = request.params as { todoItemId: string };
    //         await todoItemCollection.doc(todoItemId).delete();
    //
    //         await reply.code(200).send();
    //       } catch (e: any) {
    //         return reply.code(404).send('To-do item not found');
    //       }
    //     }
    // });
  }
