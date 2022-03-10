import {expect} from "chai";
import { fastify } from "../../lib/fastify";
import {projectCorrectBody} from "../helpers/body-helper";
import {clearDB} from "../helpers/test-helper";
import {generateJWT} from "../../bin/json-web-token";
import {Project} from "../../schemas/types/project";

describe('projects routes', () => {

  let JWT = '';
  const unknownUserJWT = generateJWT('783462');
  const EXPIRED_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NzkyODQzMTgiLCJpYXQiOjE2NDY2Nzc4NzIsImV4cCI6MTY0NjY5OTQ3Mn0.XW4EFMxo1lkl6M3x8J6tFb9SlP_sq1M7Wrh_hqP3mAg';

  const supplyPayload = {
    name: "Test",
    description: "Test",
    type: "Test",
    color: "Test",
    quantity: 20
  };

  beforeEach(async () => {
    await clearDB();
    const res = await fastify.inject({method: 'POST', url: '/users/', payload : {
        email: 'samuelvideau@yahoo.fr',
        password: 'password'
      }});
    const resBody: {jwt: {token: string}, userId: string} = JSON.parse(res.body) as {jwt: {token: string}, userId: string};
    JWT = resBody.jwt.token;
  })

  describe('POST /projects/', () => {

    it('should return 400 if missing property in body', async () => {
      const res = await fastify.inject({method: 'POST', url: '/projects/', payload : {
          name: 'Project name'
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 404 if unknown supplies', async () => {
      const res = await fastify.inject({method: 'POST', url: '/projects/', payload : projectCorrectBody('3721734', '237462342'), headers: {
        authorization: 'Bearer ' + JWT
        }});

      expect(res.statusCode).to.equal(404);
    });

    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({method: 'POST', url: '/projects/', payload : projectCorrectBody('3721734', '237462342')});

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({method: 'POST', url: '/projects/', payload : projectCorrectBody('3721734', '237462342'), headers: {
        authorization: 'Bearer ' + EXPIRED_JWT
        }});

      expect(res.statusCode).to.equal(401);
    });

    it('should return 200 if correct body', async () => {
      const supplyId1: string = (JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : supplyPayload})).body) as {id: string}).id;
      const supplyId2: string = (JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : supplyPayload})).body) as {id: string}).id;
      const res = await fastify.inject({method: 'POST', url: '/projects/', payload : projectCorrectBody(supplyId1, supplyId2), headers: {
          authorization: 'Bearer ' + JWT
        }});
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /project/:projectId/', () => {

    let project: Project;

    beforeEach(async () => {
      const supplyId1: string = (JSON.parse((await fastify.inject({method: 'POST', url: '/supplies/', payload : supplyPayload})).body) as {id: string}).id;
      const supplyId2: string = (JSON.parse((await fastify.inject({method: 'POST', url: '/supplies/', payload : supplyPayload})).body) as {id: string}).id;
      project = JSON.parse((await fastify.inject({method: 'POST', url: '/projects/', payload : projectCorrectBody(supplyId1, supplyId2), headers: {
          authorization: 'Bearer ' + JWT
        }})).body) as Project;
    })

    it('should return 401 if no JWT', async () => {
      if (project.id) {
        const res = await fastify.inject({method: 'GET', url: '/projects/' + project.id});

        expect(res.statusCode).to.equal(401);
      } else throw Error('No id');
    });

    it('should return 401 if expired JWT', async () => {
      if (project.id) {
        const res = await fastify.inject({method: 'GET', url: '/projects/' + project.id, headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
          }});

        expect(res.statusCode).to.equal(401);
      } else throw Error('No id');
    });

    it('should return 403 if JWT of another user', async () => {
      if (project.id) {
        const res = await fastify.inject({method: 'GET', url: '/projects/' + project.id, headers: {
            authorization: 'Bearer ' + unknownUserJWT
          }});

        expect(res.statusCode).to.equal(403);
      } else throw Error('No id');
    });

    it('should return 403 if unknown project id', async () => {
      if (project.id) {
        const res = await fastify.inject({method: 'GET', url: '/projects/' + project.id + '0', headers: {
            authorization: 'Bearer ' + JWT
          }});

        expect(res.statusCode).to.equal(403);
      } else throw Error('No id');
    });

    it('should return 200 if correct info', async () => {
      if (project.id) {
        const res = await fastify.inject({method: 'GET', url: '/projects/' + project.id, headers: {
            authorization: 'Bearer ' + JWT
          }});

        expect(res.statusCode).to.equal(200);
      } else throw Error('No id');
    });
  });

});
