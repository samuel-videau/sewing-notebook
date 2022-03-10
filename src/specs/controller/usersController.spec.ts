import {expect} from "chai";
import { fastify } from "../../lib/fastify";
import jwt from 'jsonwebtoken';
import {JWTPayload} from "../../bin/json-web-token";
import {JWT_SECRET} from "../../environment/endpoints";
import {clearDB} from "../helpers/test-helper";

export const usersControllerSpec = () => describe('users routes', () => {

  describe('POST /users/', () => {

    beforeEach(async () => {
      await clearDB();
    });

    it('should return 400 if missing property in body', async () => {
      const res = await fastify.inject({method: 'POST', url: '/users/', payload : {
          email: 'samuelvideau@yahoo.fr'
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if incorrect email', async () => {
      const res = await fastify.inject({method: 'POST', url: '/users/', payload : {
          email: 'samuelvideau',
          password: 'password'
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 200 if correct body', async () => {
      const res = await fastify.inject({method: 'POST', url: '/users/', payload : {
          email: 'samuelvideau@yahoo.fr',
          password: 'password'
        }});

      expect(res.statusCode).to.equal(200);
    });

    it('should return a jwt correct token', async () => {
      const res = await fastify.inject({method: 'POST', url: '/users/', payload : {
          email: 'samuel@dropps.io',
          password: 'password'
        }});
      const resBody: {jwt: {token: string}, userId: string} = JSON.parse(res.body) as {jwt: {token: string}, userId: string};
      const jwtPayload: JWTPayload = jwt.verify(resBody.jwt.token, JWT_SECRET) as JWTPayload;

      expect(jwtPayload.userId).to.equal(resBody.userId);
    });
  });

});
