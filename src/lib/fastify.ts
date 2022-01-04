import fastifyFactory from 'fastify'
import {suppliesController} from "../controller/suppliesController";

import * as projectSchema from '../schemas/json/project.json';
import * as todoItemSchema from '../schemas/json/todo-item.json';
import * as supplySchema from '../schemas/json/supply.json';

export const fastify = fastifyFactory({ logger: true })
  .addSchema(todoItemSchema)
  .addSchema(projectSchema)
  .addSchema(supplySchema)
  .register(suppliesController, { prefix: '/supplies' })
