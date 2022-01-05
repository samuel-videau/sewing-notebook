import { expect } from 'chai';
import { fastify } from '../../lib/fastify';

describe('suppliesController Test', () => {

    it('GET should return all supplies', async () => {
        const res = await fastify.inject({ method: 'GET', url: '/supplies' })
        expect(res.statusCode).to.equal(200);
    });
  });