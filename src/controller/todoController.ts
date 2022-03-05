import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as todoItemSchema from "../schemas/json/todo-item.json";
import {completeTodo, deleteTodo, editTodo, insertTodo, queryAllTodosOfProject, queryTodo} from "../bin/DB/todos.table";
import {commitTransaction, rollbackTransaction, startTransaction} from "../bin/DB/mysql";
import {logError} from "../bin/logger";
import {error, ERROR_INTERNAL} from "../bin/utils/error-messages";
import {
  insertSupplyRequired,
  queryAllSuppliesRequiredOfTodo
} from "../bin/DB/suppliesRequired.table";
import {SupplyRequired} from "../schemas/types/supplyRequired";
import {editSupply, querySupply} from "../bin/DB/supplies.table";
import {Supply} from "../schemas/types/supply";

const projectParamsSchema = {
  type: 'object',
  required: ['projectId'],
  properties: {
    projectId: { type: 'string' }
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

    fastify.route<{ Body: TodoItem }>({
      method: 'POST',
      url: '/',
      schema: {
        description: 'Create a to-do item',
        tags: ['to-do'],
        summary: 'Create a to-do item',
        body: todoItemSchema,
        params : projectParamsSchema,
        response: { 200: todoItemSchema}
      },
      handler: async function (request, reply) {
        try {
          const todo: TodoItem = request.body;
          const { projectId } = request.params as { projectId: string };

          await startTransaction();
          todo.id = await insertTodo(projectId, todo.name, todo.description, todo.completed);

          if (todo.suppliesRequired) {
            for (let i = 0 ; i < todo.suppliesRequired.length; i++) {
              const supplyRequired: SupplyRequired = todo.suppliesRequired[i];
              supplyRequired.id = await insertSupplyRequired(todo.id, supplyRequired.supplyId, supplyRequired.quantity);
              todo.suppliesRequired[i] = supplyRequired;
            }
          }

          await commitTransaction();
          return reply.code(200).send(todo);
        }
        catch (e) {
          await rollbackTransaction();
          logError(e);
          return reply.code(500).send(error(500, ERROR_INTERNAL));
        }
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
          try {
            const { projectId } = request.params as { projectId: string };
            const todo: TodoItem[] = await queryAllTodosOfProject(projectId);
            for (let i = 0; i < todo.length; i++) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              todo[i].suppliesRequired = await queryAllSuppliesRequiredOfTodo(todo[i].id);
            }

            return reply.code(200).send(todo);
          } catch (e) {
            logError(e);
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
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
            const { projectId, todoItemId } = request.params as { projectId: string, todoItemId: string };
            const todo: TodoItem = await queryTodo(todoItemId);
            todo.suppliesRequired = await queryAllSuppliesRequiredOfTodo(todoItemId);
            return reply.code(200).send(todo);
          } catch (e) {
            logError(e);
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'PUT',
        url: '/:todoItemId',
        schema: {
            body: todoItemSchema,
            params: projectTodoParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { projectId, todoItemId } = request.params as { projectId: string, todoItemId: string };
            await editTodo(todoItemId, request.body.name, request.body.description)
            await reply.code(200).send();
          } catch (e: any) {
            logError(e);
            return reply.code(500).send(error(500, ERROR_INTERNAL));
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
            const { projectId, todoItemId } = request.params as { projectId: string, todoItemId: string };
            await deleteTodo(todoItemId);
            await reply.code(200).send();
          } catch (e: any) {
            return reply.code(500).send(error(500, ERROR_INTERNAL));
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
        const { projectId, todoItemId } = request.params as { projectId: string, todoItemId: string };

        await startTransaction();
        const suppliesRequired: SupplyRequired[] = await queryAllSuppliesRequiredOfTodo(todoItemId);

        for (const supplyRequired of suppliesRequired) {
          const supply: Supply = await querySupply(supplyRequired.supplyId);
          const quantityLeft: number = supply.quantity - supplyRequired.quantity;
          if (quantityLeft < 0) {
            await rollbackTransaction();
            return reply.code(403).send(error(403, 'Quantity of ' + supply.name + ' is not enough'));
          }
          if (supply.id){
            await editSupply(supply.id, supply.name, supply.description, quantityLeft, supply.type, supply.color);
          } else {
            await rollbackTransaction();
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
        }

        await completeTodo(todoItemId);

        return reply.code(200).send();
      } catch (e: any) {
        logError(e);
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}
