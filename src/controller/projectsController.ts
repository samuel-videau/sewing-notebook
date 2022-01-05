import { FastifyInstance } from 'fastify'
import { Project } from "../schemas/types/project";

import * as projectSchema from "../schemas/json/project.json";

const projectIdSchema = {
    type: 'object',
    properties: {
        projectId: { type: 'number' }
    }
}

export async function projectsController (fastify: FastifyInstance) {
    fastify.route<{ Body: Project }>({
      method: 'POST',
      url: '/',
      schema: {
        body: projectSchema,
        response: { 200: projectSchema },
      },
      handler: async function (request, reply) {
      }
    });

    fastify.route<{ Body: Project }>({
        method: 'GET',
        url: '/',
        handler: async function (request, reply) {
        }
      });

    fastify.route<{ Body: Project }>({
        method: 'GET',
        url: '/:projectId',
        schema: {
            params : projectIdSchema
        },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: Project }>({
        method: 'PUT',
        url: '/:projectId',
        schema: {
            body: projectSchema,
            params : projectIdSchema
          },
        handler: async function (request, reply) {
        }
    });

    fastify.route<{ Body: Project }>({
        method: 'DELETE',
        url: '/:projectId',
        schema: {
            params : projectIdSchema
          },
        handler: async function (request, reply) {
        }
    });
  }
