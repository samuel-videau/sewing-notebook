import {expect} from "chai";
import { fastify } from "../../lib/fastify";
import {projectCorrectBody} from "../helpers/body-helper";
import {clearDB} from "../helpers/test-helper";
import {generateJWT} from "../../bin/json-web-token";
import {Project} from "../../schemas/types/project";
import {describe} from "mocha";

describe('todos routes', () => {

  let [JWT, projectId, supplyId1, supplyId2] = ['', '', '', ''];
  let project: Project;
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
    const res = await fastify.inject({
      method: 'POST', url: '/users/', payload: {
        email: 'samuelvideau@yahoo.fr',
        password: 'password'
      }
    });
    const resBody: { jwt: { token: string }, userId: string } = JSON.parse(res.body) as { jwt: { token: string }, userId: string };
    JWT = resBody.jwt.token;

    supplyId1 = (JSON.parse((await fastify.inject({
      method: 'POST',
      url: 'supplies',
      payload: supplyPayload
    })).body) as { id: string }).id;
    supplyId2 = (JSON.parse((await fastify.inject({
      method: 'POST',
      url: 'supplies',
      payload: supplyPayload
    })).body) as { id: string }).id;
    const projectRes = await fastify.inject({
      method: 'POST', url: '/projects/', payload: projectCorrectBody(supplyId1, supplyId2), headers: {
        authorization: 'Bearer ' + JWT
      }
    });

    project = JSON.parse(projectRes.body) as Project;
    projectId = project.id ? project.id : '';
  })

  describe('POST /projects/:projectId/todo', () => {

    it('should return 400 if missing property in body', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: supplyId1, quantity: 15},
            {supplyId: supplyId2, quantity: 15}
          ]
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if negative quantity', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          description: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: supplyId1, quantity: -15},
            {supplyId: supplyId2, quantity: 15}
          ]
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(400);
    });

    it('should return 404 if unknown supplies', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          description: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: '743823729', quantity: 15},
            {supplyId: '09283432', quantity: 15}
          ]
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(404);
    });

    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          description: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: supplyId1, quantity: 15},
            {supplyId: supplyId2, quantity: 15}
          ]
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          description: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: supplyId1, quantity: 15},
            {supplyId: supplyId2, quantity: 15}
          ]
        }, headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 200 if correct body', async () => {
      const res = await fastify.inject({
        method: 'POST', url: '/projects/' + projectId + '/todo', payload: {
          name: "test",
          description: "test",
          completed: false,
          suppliesRequired: [
            {supplyId: supplyId2, quantity: 15},
            {supplyId: supplyId1, quantity: 15}
          ]
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /projects/:projectId/todo', () => {

    it('should return 403 if unknown project', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + '23744234' + '/todo', headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo'
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo', headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 403 if JWT of another user', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo', headers: {
          authorization: 'Bearer ' + generateJWT('238472364')
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 200 if correct request', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo', headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /projects/:projectId/todo/:todoId', () => {

    let todoId = '';

    beforeEach(() => {
      if (project.todo) {
        todoId = project.todo[0].id ? project.todo[0].id : '';
      }
    });

    it('should return 404 if unknown todo', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo/76347623' , headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(404);
    });

    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo/' + todoId
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo/' + todoId , headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 403 if JWT of another user', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo/' + todoId , headers: {
          authorization: 'Bearer ' + generateJWT('30927842')
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 200 if correct request', async () => {
      const res = await fastify.inject({
        method: 'GET', url: '/projects/' + projectId + '/todo/' + todoId , headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PUT /projects/:projectId/todo/:todoId', () => {

    let todoId = '';

    beforeEach(() => {
      if (project.todo) {
        todoId = project.todo[0].id ? project.todo[0].id : '';
      }
    });

    it('should return 400 if missing property in body', async () => {
      const res = await fastify.inject({
        method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId , payload: {
          name: "test",
          completed: false,
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(400);
    });


    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({
        method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId, payload: {
          name: "Edit",
          description: "Edit",
          completed: false,
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({
        method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId, payload: {
          name: "Edit",
          description: "Edit",
          completed: false,
        }, headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 403 if JWT of another user', async () => {
      const res = await fastify.inject({
        method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId, payload: {
          name: "Edit",
          description: "Edit",
          completed: false,
        }, headers: {
          authorization: 'Bearer ' + generateJWT('42472342')
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 200 if correct body', async () => {
      const res = await fastify.inject({
        method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId, payload: {
          name: "Edit",
          description: "Edit",
          completed: false,
        }, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('DELETE /projects/:projectId/todo/:todoId', () => {

    let todoId = '';

    beforeEach(() => {
      if (project.todo) {
        todoId = project.todo[0].id ? project.todo[0].id : '';
      }
    });

    it('should return 404 if unknown todo', async () => {
      const res = await fastify.inject({
        method: 'DELETE', url: '/projects/' + projectId + '/todo/' + '3424234', headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(404);
    });


    it('should return 401 if no JWT', async () => {
      const res = await fastify.inject({
        method: 'DELETE', url: '/projects/' + projectId + '/todo/' + todoId
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 401 if expired JWT', async () => {
      const res = await fastify.inject({
        method: 'DELETE', url: '/projects/' + projectId + '/todo/' + todoId, headers: {
          authorization: 'Bearer ' + EXPIRED_JWT
        }
      });

      expect(res.statusCode).to.equal(401);
    });

    it('should return 403 if JWT of another user', async () => {
      const res = await fastify.inject({
        method: 'DELETE', url: '/projects/' + projectId + '/todo/' + todoId, headers: {
          authorization: 'Bearer ' + generateJWT('1728371')
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 200 if correct body', async () => {
      const res = await fastify.inject({
        method: 'DELETE', url: '/projects/' + projectId + '/todo/' + todoId, headers: {
          authorization: 'Bearer ' + JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });
  });


  // describe('PUT /projects/:projectId/todo/:todoId/complete', () => {
  //
  //   let todoId = '';
  //
  //   beforeEach(() => {
  //     if (project.todo) {
  //       todoId = project.todo[0].id ? project.todo[0].id : '';
  //     }
  //   });
  //
  //   it('should return 401 if no JWT', async () => {
  //     const res = await fastify.inject({
  //       method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId + '/complete'
  //     });
  //
  //     expect(res.statusCode).to.equal(401);
  //   });
  //
  //   it('should return 401 if expired JWT', async () => {
  //     const res = await fastify.inject({
  //       method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId + '/complete', headers: {
  //         authorization: 'Bearer ' + EXPIRED_JWT
  //       }
  //     });
  //
  //     expect(res.statusCode).to.equal(401);
  //   });
  //
  //   it('should return 403 if JWT of another user', async () => {
  //     const res = await fastify.inject({
  //       method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId + '/complete', headers: {
  //         authorization: 'Bearer ' + generateJWT('842742634')
  //       }
  //     });
  //
  //     expect(res.statusCode).to.equal(403);
  //   });
  //
  //   it('should return 200 if correct request', async () => {
  //     const res = await fastify.inject({
  //       method: 'PUT', url: '/projects/' + projectId + '/todo/' + todoId + '/complete', headers: {
  //         authorization: 'Bearer ' + JWT
  //       }
  //     });
  //
  //     expect(res.statusCode).to.equal(200);
  //   });
  // });
});
