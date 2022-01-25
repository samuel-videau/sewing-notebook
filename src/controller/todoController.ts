import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as admin from 'firebase-admin';
import * as todoItemSchema from "../schemas/json/todo-item.json";
import * as updateTodoItemSchema from "../schemas/json/update-todo-item.json";
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

const projectTodoParamsSchema = {
  type: 'object',
  required: ['todoItemId', 'projectId'],
  properties: {
    projectId: { type: 'string' },
    todoItemId: { type: 'string' }
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
        body: todoItemSchema,
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

    fastify.route<{ Body: TodoItem }>({
        method: 'GET',
        url: '/:todoItemId',
        schema: {
            response: { 200: todoItemSchema },
            params: projectTodoParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            const { todoItemId } = request.params as { todoItemId: string };
            const doc = await projectCollection.doc(projectId).collection('todo').doc(todoItemId).get();
            if (!doc.exists) return reply.code(404).send('Item not Found');
            return reply.code(200).send(JSON.stringify(doc.data() as TodoItem));
          } catch (e: any) {
            return reply.code(500).send('Internal Error');
          }
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'PUT',
        url: '/:todoItemId',
        schema: {
            body: updateTodoItemSchema,
            params: projectTodoParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            const { todoItemId } = request.params as { todoItemId: string };
            await projectCollection.doc(projectId).collection('todo').doc(todoItemId).update(request.body);
            await reply.code(200).send();
          } catch (e: any) {
            return reply.code(500).send('Internal Error');
          }
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'DELETE',
        url: '/:todoItemId',
        schema: {
            params: projectTodoParamsSchema
        },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            const { todoItemId } = request.params as { todoItemId: string };
            await projectCollection.doc(projectId).collection('todo').doc(todoItemId).delete();

            await reply.code(200).send();
          } catch (e: any) {
            return reply.code(404).send('To-do item not found');
          }
        }
    });


  fastify.route<{ Body: TodoItem }>({
    method: 'PUT',
    url: '/:todoItemId/complete',
    schema: {
      params: projectTodoParamsSchema
    },
    handler: async function (request, reply) {
      try {
        await admin.firestore().runTransaction(async transaction => {
          const { projectId } = request.params as { projectId: string };
          const { todoItemId } = request.params as { todoItemId: string };

          const doc = await projectCollection.doc(projectId).collection('todo').doc(todoItemId).get();
          if (!doc.exists) return reply.code(404).send('Not Found');

          for (const supplyRequired of (doc.data() as TodoItem).supplyRequired) {
            transaction.update(
              admin.firestore().collection('supply').doc(supplyRequired.supplyRef),
              {quantityLeft: admin.firestore.FieldValue.increment(-supplyRequired.quantity)}
            );
          }

          transaction.update(
            projectCollection.doc(projectId).collection('todo').doc(todoItemId),
            {completed: true}
          );

          return reply.code(200).send();
        });
      } catch (e: any) {
        return reply.code(500).send('Internal Error');
      }
    }
  });
  }
