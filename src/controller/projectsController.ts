import { FastifyInstance } from 'fastify';
import { Project } from "../schemas/types/project";
import * as admin from 'firebase-admin';
import * as projectSchema from "../schemas/json/project.json";
import * as updateProjectSchema from "../schemas/json/update-project.json";
import * as idResponseSchema from '../schemas/json/id-response.json';

const projectParamsSchema = {
    type: 'object',
    required: ['projectId'],
    properties: {
        projectId: { type: 'string', description: 'Id of the project' }
    }
}

export async function projectsController (fastify: FastifyInstance) {
    const projectCollection = admin.firestore().collection('project');

    fastify.route<{ Body: Project }>({
      method: 'POST',
      url: '/',
      schema: {
        description: 'Create a project',
        tags: ['project'],
        summary: 'Create a project',
        body: {projectSchema},
        response: { 200: idResponseSchema },
      },
      handler: async (request, reply) => {
        try {
          await admin.firestore().runTransaction(async (transaction) => {
            const project: Project = request.body;
            const projectDoc = projectCollection.doc();
            transaction.create(projectDoc, {name: project.name, description: project.description});
            if (project.todo) {
              for (const todo of project.todo) {
                transaction.create(projectDoc.collection('todo').doc(), todo)
              }
            }
            await reply.code(200).send(projectDoc.id);
          });
        } catch (e) {
          return reply.code(500).send('Internal Error');
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
            const data = await projectCollection.get();
            const projects = data.docs.map(project => {
              return {...project.data() as Project, id: project.id}
            });
            await reply.code(200).send(projects);
          } catch (e) {
            return reply.code(500).send('Internal Error');
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
        const project = await projectCollection.doc(projectId).get();
        await reply.code(200).send(project.data() as Project);
      } catch (e: any) {
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
            body: {updateProjectSchema},
            params : projectParamsSchema,
            response: {}
          },
        handler: async function (request, reply) {
          try {
            const { projectId } = request.params as { projectId: string };
            await projectCollection.doc(projectId).update(request.body);

            await reply.code(200).send();
          }  catch(e: any) {
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
            await admin.firestore().runTransaction(async transaction => {
              const {projectId} = request.params as { projectId: string };
              const todoEls = await projectCollection.doc(projectId).collection('todo').get();
              todoEls.docs.forEach(todoEl => {
                transaction.delete(todoEl.ref);
              });
              transaction.delete(projectCollection.doc(projectId));

              await reply.code(200).send();
            });
          } catch (e: any) {
            return reply.code(500).send('Internal Error');
          }
        }
    });
  }
