import fastifyFactory from 'fastify'
import {suppliesController} from "../controller/suppliesController";
import { projectsController } from '../controller/projectsController';
import { todoItemsController } from '../controller/todoController';
import fastifySwagger from 'fastify-swagger';

import * as projectSchema from '../schemas/json/project.json';
import * as todoItemSchema from '../schemas/json/todo-item.json';
import * as supplySchema from '../schemas/json/supply.json';
import * as updateProjectSchema from '../schemas/json/update-project.json';
import * as updateTodoItemSchema from '../schemas/json/update-todo-item.json';
import {authController} from "../controller/authController";
import {usersController} from "../controller/usersController";

export const fastify = fastifyFactory({ logger: false })
  .register(fastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Sewing Notebook',
        description: 'A sewing stash manager to follow the quantity of sewing supplies while doing projects. Some supplies will be for personnal use only, while other supplies may be shared between several users.',
        version: '0.1.0'
      },
      externalDocs: {
        url: 'https://github.com/samuel-videau/sewing-notebook',
        description: 'Link to the Github repository'
      },
      host: 'localhost:3000',
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
      docExpansion: 'list',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true
  })
  .addSchema(projectSchema)
  .addSchema(todoItemSchema)
  .addSchema(supplySchema)
  .addSchema(updateProjectSchema)
  .addSchema(updateTodoItemSchema)
  .register(suppliesController, { prefix: '/supplies' })
  .register(projectsController, { prefix: '/projects' })
  .register(authController, { prefix: '/auth' })
  .register(usersController, { prefix: '/users' })
  .register(todoItemsController, {prefix: '/projects/:projectId/todo'});

