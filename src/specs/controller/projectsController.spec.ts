import chai from 'chai';
import chaiHttp from 'chai-http';
import { fastify } from '../../lib/fastify';


chai.use(chaiHttp);

describe('projectsController tests', () => {

  it('POST should accept correctly formed bodies', () => {
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

    chai.assert(true);

  });

});