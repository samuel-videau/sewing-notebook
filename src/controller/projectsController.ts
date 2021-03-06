import { FastifyInstance } from 'fastify';
import { Project } from "../schemas/types/project";
import * as projectSchema from "../schemas/json/project.json";
import * as updateProjectSchema from "../schemas/json/update-project.json";
import * as userIdSchema from "../schemas/json/user-id.json";
import {logError} from "../bin/logger";
import {commitTransaction, rollbackTransaction, startTransaction} from "../bin/DB/mysql";
import {deleteProject, editProject, insertProject, queryAllProjects, queryProject} from "../bin/DB/projects.table";
import {
  error,
  ERROR_INTERNAL,
  ERROR_PROJECT_NOT_FOUND,
  ERROR_SUPPLY_NOT_FOUND,
  ERROR_USER_NOT_FOUND
} from "../bin/utils/error-messages";
import {insertTodo, queryAllTodosOfProject} from "../bin/DB/todos.table";
import {TodoItem} from "../schemas/types/todo-item";
import {
  insertSupplyRequired,
  queryAllSuppliesRequiredOfTodo,
} from "../bin/DB/suppliesRequired.table";
import {MysqlError} from "mysql";
import {deleteProjectAuth, insertProjectAuth} from "../bin/DB/project-auth.table";
import {verifyJWT} from "../bin/json-web-token";

const projectParamsSchema = {
    type: 'object',
    required: ['projectId'],
    properties: {
        projectId: { type: 'string', description: 'Id of the project' }
    }
}

const projectUserParamsSchema = {
  type: 'object',
  required: ['projectId', 'userId'],
  properties: {
    projectId: { type: 'string', description: 'Id of the project' },
    userId: { type: 'string', description: 'Id of the user' }
  }
}

export async function projectsController (fastify: FastifyInstance) {
    fastify.route<{ Body: Project }>({
      method: 'POST',
      url: '/',
      schema: {
        description: 'Create a project',
        tags: ['project'],
        summary: 'Create a project',
        body: projectSchema,
        response: { 200: projectSchema },
      },
      handler: async (request, reply) => {
        try {
          const userId: string = await verifyJWT(request, reply);
          const project: Project = request.body;
          await startTransaction();
          const projectId = await insertProject(project.name, project.description);
          project.id = projectId;
          if (project.todo) {
            for (let i = 0 ; i < project.todo.length ; i++) {
              const todoItem: TodoItem = project.todo[i];
              todoItem.id = await insertTodo(projectId, todoItem.name, todoItem.description, todoItem.completed);

              if (todoItem.suppliesRequired) {
                for (let j = 0 ; j < todoItem.suppliesRequired.length ; j++) {
                  const supplyRequired = todoItem.suppliesRequired[j];
                  supplyRequired.id = await insertSupplyRequired(todoItem.id, supplyRequired.supplyId, supplyRequired.quantity);
                  todoItem.suppliesRequired[j] = supplyRequired;
                }
              }
              project.todo[i] = todoItem;
            }
          }

          await insertProjectAuth(userId, projectId);

          await commitTransaction();
          await reply.code(200).send({projectId, ...project});
        } catch (e) {
          await rollbackTransaction();
          logError(e);
          if ((e as MysqlError).errno === 1452) return reply.code(404).send(error(404, ERROR_SUPPLY_NOT_FOUND))
          return reply.code(500).send(error(500, ERROR_INTERNAL));
        }
      }
    });

    fastify.route<{ Body: Project }>({
        method: 'GET',
        url: '/',
        schema: {
          description: 'Get the list of all projects',
          tags: ['project'],
          summary: 'Get all projects',
            response: { 200: {
                "type": "array",
                "items": projectSchema
              }
            }
          },
        handler: async function (request, reply) {
          try {
            const projects: Project[] = await queryAllProjects();
            return reply.code(200).send(projects);
          } catch (e) {
            logError(e);
            return reply.code(500).send(error(500, ERROR_INTERNAL));
          }
        }
      });

    fastify.route({
    method: 'GET',
    url: '/:projectId',
    schema: {
      description: 'Get information about a specific project',
      tags: ['project'],
      summary: 'Get a specific project',
        response: { 200:  projectSchema },
        params : projectParamsSchema
    },
    handler: async function (request, reply) {
      try {
        const {projectId} = request.params as { projectId: string };
        await verifyJWT(request, reply, projectId);
        const project: Project = await queryProject(projectId);
        const todo: TodoItem[] = await queryAllTodosOfProject(projectId);

        if (!project) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));

        if (todo) {
          project.todo = todo;
          for (let i = 0 ; i < todo.length; i++) {
            const todoItem = project.todo[i];
            if (todoItem.id) todoItem.suppliesRequired = await queryAllSuppliesRequiredOfTodo(todoItem.id);
            project.todo[i] = todoItem;
          }
        }

        return reply.code(200).send(project);
      } catch (e: any) {
        logError(e);
        return reply.code(500).send('Internal Error');
      }
    }
    });

    fastify.route<{ Body: Project }>({
        method: 'PUT',
        url: '/:projectId',
        schema: {
          description: 'Modify a specific project',
          tags: ['project'],
          summary: 'Modify information about a specific project',
            body: updateProjectSchema,
            params : projectParamsSchema,
            response: {}
          },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            await verifyJWT(request, reply, projectId);
            await editProject(projectId, request.body.name, request.body.description);
            await reply.code(200).send();
          }  catch(e: any) {
            logError(e);
            if (e === ERROR_PROJECT_NOT_FOUND) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));
            return reply.code(500).send('Internal Error');
          }
        }
    });

    fastify.route<{ Body: Project }>({
        method: 'DELETE',
        url: '/:projectId',
        schema: {
            description: 'Delete a specific project',
            tags: ['project'],
            summary: 'Delete a specific project',
            params : projectParamsSchema
          },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            await verifyJWT(request, reply, projectId);
            await deleteProject(projectId);
            await reply.code(200).send();
          } catch (e: any) {
            logError(e);
            if (e === ERROR_PROJECT_NOT_FOUND) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));
            return reply.code(500).send('Internal Error');
          }
        }
    });

  fastify.route<{ Body: { userId: string } }>({
    method: 'POST',
    url: '/:projectId/permissions',
    schema: {
      description: 'Set the permissions to a user to access this project',
      tags: ['project'],
      summary: 'Give permissions to a user',
      params: projectParamsSchema,
      body: userIdSchema
    },
    handler: async function (request, reply) {
      try {
        const { projectId } = request.params as { projectId: string };
        const { userId } = request.body;
        await verifyJWT(request, reply, projectId);
        await insertProjectAuth(userId, projectId);
        await reply.code(200).send({message: 'The permissions were successfully granted'});
      } catch (e: any) {
        logError(e);
        if ((e as MysqlError).errno === 1452 && (e as MysqlError).sqlMessage?.includes('user')) return reply.code(404).send(error(404, ERROR_USER_NOT_FOUND));
        if (e === ERROR_PROJECT_NOT_FOUND) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));
        return reply.code(500).send('Internal Error');
      }
    }
  });

  fastify.route({
    method: 'DELETE',
    url: '/:projectId/permissions/:userId',
    schema: {
      description: 'Revoke the permissions to a user to access this project',
      tags: ['project'],
      summary: 'Revoke permissions to a user',
      params: projectUserParamsSchema,
    },
    handler: async function (request, reply) {
      const { projectId, userId } = request.params as { projectId: string, userId: string };
      await verifyJWT(request, reply, projectId);
      try {
        await deleteProjectAuth(userId, projectId);
        await reply.code(200).send({message: 'The permissions were successfully revoked'});
      } catch (e: any) {
        console.log(e)
        logError(e);
        if ((e as MysqlError).errno === 1452 && (e as MysqlError).sqlMessage?.includes('user')) return reply.code(404).send(error(404, ERROR_USER_NOT_FOUND));
        if (e === ERROR_PROJECT_NOT_FOUND) return reply.code(404).send(error(404, ERROR_PROJECT_NOT_FOUND));
        return reply.code(500).send(error(500, ERROR_INTERNAL));
      }
    }
  });
}
