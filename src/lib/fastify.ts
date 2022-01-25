import fastifyFactory from 'fastify'
import {suppliesController} from "../controller/suppliesController";
import { projectsController } from '../controller/projectsController';
import { todoItemsController } from '../controller/todoController';
import fastifySwagger from 'fastify-swagger';

import * as projectSchema from '../schemas/json/project.json';
import * as todoItemSchema from '../schemas/json/todo-item.json';
import * as supplySchema from '../schemas/json/supply.json';

export const fastify = fastifyFactory({ logger: true })
  .addSchema(todoItemSchema)
  .addSchema(projectSchema)
  .addSchema(supplySchema)
  .register(suppliesController, { prefix: '/supplies' })
  .register(projectsController, { prefix: '/projects' })
  .register(todoItemsController, {prefix: '/projects/:projectId/todo'})
  .register(fastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Sewing Notebook',
        description: 'We are creating a sewing stash manager to follow the quantity of sewing supplies while doing projects. Some supplies will be for personnal use only, while other supplies may be shared between several users.',
        version: '0.1.0'
      },
      externalDocs: {
        url: 'https://github.com/samuel-videau/sewing-notebook',
        description: 'Link to the Github repository'
      },
      host: 'localhost',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'supply', description: 'End-points related to supplies management' },
        { name: 'project', description: 'End-points related to projects management' },
        { name: 'to-do', description: 'End-points related to to-do list management' }
      ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true
  });
  
