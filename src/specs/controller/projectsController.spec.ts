import { expect } from 'chai';
import { fastify } from '../../lib/fastify';

describe('projectsController tests', () => {

  it('POST should accept correctly formed bodies', async () => {
    const projectBody = {
        name : 'Project name',
        description: 'Project description',
        todo: [{
            name: 'ToDo1',
            description: 'First to-do item',
            completed: false,
            supplyRequired: [{
                    supplyRef: 'supplyREF',
                    quantity: 1
            }] 
        }]
    };

    const res = await fastify.inject({ method: 'POST', url: '/projects', payload: projectBody});
    expect(res.statusCode).to.equal(200);
  });

});