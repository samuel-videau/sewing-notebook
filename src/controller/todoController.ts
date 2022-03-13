import { FastifyInstance } from 'fastify'
import { TodoItem } from "../schemas/types/todo-item";
import * as todoItemSchema from "../schemas/json/todo-item.json";
import {completeTodo, deleteTodo, editTodo, insertTodo, queryAllTodosOfProject, queryTodo} from "../bin/DB/todos.table";
import {commitTransaction, rollbackTransaction, startTransaction} from "../bin/DB/mysql";
import {logError} from "../bin/logger";
import {
  error,
  ERROR_INTERNAL,
  ERROR_PROJECT_NOT_FOUND,
  ERROR_SUPPLY_NOT_FOUND,
  ERROR_TODO_NOT_FOUND
} from "../bin/utils/error-messages";
import {
  insertSupplyRequired,
  queryAllSuppliesRequiredOfTodo
} from "../bin/DB/suppliesRequired.table";
import {SupplyRequired} from "../schemas/types/supplyRequired";
import {editSupply, querySupply} from "../bin/DB/supplies.table";
import {Supply} from "../schemas/types/supply";
import {MysqlError} from "mysql";
import {verifyJWT} from "../bin/json-web-token";

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
          await verifyJWT(request, reply, projectId);

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
          if ((e as MysqlError).errno === 1452 && (e as MysqlError).sqlMessage?.includes('project')) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));
          if ((e as MysqlError).errno === 1452 && (e as MysqlError).sqlMessage?.includes('supply')) return reply.code(404).send(error(404, ERROR_SUPPLY_NOT_FOUND));
          return reply.code(500).send(error(500, ERROR_INTERNAL));
        }
      }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'GET',
        url: '/',
        schema: {
            description: 'Get the list of all to-do items of a specific project',
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
            await verifyJWT(request, reply, projectId);

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
            description: 'Get a specific to-do item',
            tags: ['to-do'],
            summary: 'Get a to-do item',
            response: { 200: todoItemSchema },
            params: projectTodoParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { todoItemId } = request.params as { todoItemId: string };
            const todo: TodoItem = await queryTodo(todoItemId);
            if (!todo) return reply.code(404).send(error(404, ERROR_TODO_NOT_FOUND));
            await verifyJWT(request, reply, todo.projectId);
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
            description: 'Edit the information of a to-do item',
            tags: ['to-do'],
            summary: 'Edit a to-do item',
            body: todoItemSchema,
            params: projectTodoParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { todoItemId } = request.params as { todoItemId: string };
            const todo: TodoItem = await queryTodo(todoItemId);
            await verifyJWT(request, reply, todo.projectId);
            await editTodo(todoItemId, request.body.name, request.body.description)
            await reply.code(200).send();
          } catch (e: any) {
            logError(e);
            if (e === ERROR_TODO_NOT_FOUND) return reply.code(404).send(error(404, ERROR_TODO_NOT_FOUND));
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
        }
    });

    fastify.route<{ Body: TodoItem }>({
        method: 'DELETE',
        url: '/:todoItemId',
        schema: {
          description: 'Delete a to-do item',
          tags: ['to-do'],
          summary: 'Delete a to-do item',
            params: projectTodoParamsSchema
        },
        handler: async function (request, reply) {
          try {
            const { todoItemId } = request.params as { todoItemId: string };
            const todo: TodoItem = await queryTodo(todoItemId);
            if (!todo) return reply.code(404).send(error(404, ERROR_TODO_NOT_FOUND));
            await verifyJWT(request, reply, todo.projectId);
            await deleteTodo(todoItemId);
            await reply.code(200).send();
          } catch (e: any) {
            logError(e);
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
        }
    });


  fastify.route<{ Body: TodoItem }>({
    method: 'PUT',
    url: '/:todoItemId/complete',
    schema: {
      description: 'Set the status of a to-do item as complete, this will update the supplies quantities',
      tags: ['to-do'],
      summary: 'Complete a to-do item',
      params: projectTodoParamsSchema
    },
    handler: async function (request, reply) {
      try {
        const { todoItemId } = request.params as { todoItemId: string };

        const todo: TodoItem = await queryTodo(todoItemId);
        await verifyJWT(request, reply, todo.projectId);

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
        if (e === ERROR_TODO_NOT_FOUND) return reply.code(404).send(error(404, ERROR_TODO_NOT_FOUND));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}
