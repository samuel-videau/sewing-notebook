import { FastifyInstance } from 'fastify'
import { Project } from "../schemas/types/project";
import * as admin from 'firebase-admin';
import * as projectSchema from "../schemas/json/project.json";

const projectParamsSchema = {
    type: 'object',
    required: ['projectId'],
    properties: {
        projectId: { type: 'string' }
    }
}

export async function projectsController (fastify: FastifyInstance) {
    const projectCollection = admin.firestore().collection('project');

    fastify.route<{ Body: Project }>({
      method: 'POST',
      url: '/',
      schema: {
        body: projectSchema,
        response: { 200: projectSchema },
      },
      handler: async (request, reply) => {
        const newProject =  await projectCollection.add(request.body);
        await reply.code(200).send((await newProject.get()).data() as Project );
      }
    });

    fastify.route<{ Body: Project }>({
        method: 'GET',
        url: '/',
        schema: {
            response: { 200: {
                "type": "array",
                "items": projectSchema
              }
            }
          },
        handler: async function (request, reply) {
            const projects = await projectCollection.get();
            await reply.code(200).send( projects.docs.map(project => project.data() as Project) );
        }
      });

    fastify.route({
    method: 'GET',
    url: '/:projectId',
    schema: {
        response: { 200:  projectSchema },
        params : projectParamsSchema
    },
    handler: async function (request, reply) {
        const { projectId } = request.params as { projectId: string };
        const project = await projectCollection.doc(projectId).get();
        await reply.code(200).send(project.data() as Project);
    }
    });

    fastify.route<{ Body: Project }>({
        method: 'PUT',
        url: '/:projectId',
        schema: {
            body: projectSchema,
            params : projectParamsSchema,
            response: {}
          },
        handler: async function (request, reply) {
            const { projectId } = request.params as { projectId: string };
            await projectCollection.doc(projectId).set(request.body);

            await reply.code(200).send();
        }
    });

    fastify.route<{ Body: Project }>({
        method: 'DELETE',
        url: '/:projectId',
        schema: {
            params : projectParamsSchema
          },
        handler: async function (request, reply) {
            const { projectId } = request.params as { projectId: string };
            await projectCollection.doc(projectId).delete();

            await reply.code(200).send();
        }
    });
  }
