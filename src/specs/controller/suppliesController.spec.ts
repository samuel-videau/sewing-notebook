import {expect} from "chai";
import { fastify } from "../../lib/fastify";
import {Supply} from "../../schemas/types/supply";
import {clearDB} from "../helpers/test-helper";

describe('supplies routes', () => {

  beforeEach(async () => {
    await clearDB();
  })

  describe('POST /supplies/', () => {

    it('should return 400 if missing property in body', async () => {
      const res = await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          color: "Test",
          quantity: 20
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if negative quantity in body', async () => {
      const res = await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          type: "Test",
          color: "Test",
          quantity: -20
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 200 if incorrect body', async () => {
      const res = await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          type: "Test",
          color: "Test",
          quantity: 20
        }});

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /supplies/', () => {
    const suppliesToCreate = 5;
    let supplies: Supply[] = [];

    beforeEach(async () => {
      supplies = [];

      for (let i = 0; i < suppliesToCreate; i++) {
        const res: Supply = JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : {
            name: "Test" + i.toString(),
            description: "Test" + i.toString(),
            type: "Test" + i.toString(),
            color: "Test" + i.toString(),
            quantity: i + 10
          }})).body) as Supply;

        supplies.push(res);
      }
    });

    it('should return 200', async () => {
      const res = await fastify.inject({method: 'GET', url: 'supplies'});

      expect(res.statusCode).to.equal(200);
    });

    it('should return the right data', async () => {
      const res = await fastify.inject({method: 'GET', url: 'supplies'});
      const resSupplies: Supply[] = JSON.parse(res.body) as Supply[];

      supplies.sort((a, b) => parseInt(a.id ? a.id: '0') - parseInt(b.id ? b.id: '0'));

      console.log(resSupplies.length)
      console.log(supplies.length)

      for (let i = 0; i < resSupplies.length; i++) {
        expect(resSupplies[i].id).to.equal(supplies[i].id);
        expect(resSupplies[i].description).to.equal(supplies[i].description);
        expect(resSupplies[i].type).to.equal(supplies[i].type);
        expect(resSupplies[i].color).to.equal(supplies[i].color);
        expect(resSupplies[i].quantity).to.equal(supplies[i].quantity);
        expect(resSupplies[i].name).to.equal(supplies[i].name);
      }
    });
  });

  describe('GET /supplies/:supplyId', () => {
    let supply: Supply;

    beforeEach(async () => {
      supply = JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          type: "Test",
          color: "Test",
          quantity: 10
        }})).body) as Supply;
    });

    it('should return 404 if incorrect Id', async () => {
        const res = await fastify.inject({method: 'GET', url: 'supplies/' + '3786234892'});
        expect(res.statusCode).to.equal(404);
    });

    it('should return 200 if correct Id', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'GET', url: 'supplies/' + supply.id});
        expect(res.statusCode).to.equal(200);
      } else {
        throw Error('No supply Id');
      }
    });

    it('should return the right data if correct Id', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'GET', url: 'supplies/' + supply.id});
        const resSupply: Supply = JSON.parse(res.body) as Supply;
        expect(resSupply.id).to.equal(supply.id);
        expect(resSupply.description).to.equal(supply.description);
        expect(resSupply.type).to.equal(supply.type);
        expect(resSupply.color).to.equal(supply.color);
        expect(resSupply.quantity).to.equal(supply.quantity);
        expect(resSupply.name).to.equal(supply.name);
      } else {
        throw Error('No supply Id');
      }
    });
  });

  describe('PUT /supplies/:supplyId', () => {
    let supply: Supply;

    beforeEach(async () => {
      supply = JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          type: "Test",
          color: "Test",
          quantity: 10
        }})).body) as Supply;
    });

    it('should return 404 if incorrect Id', async () => {
      const res = await fastify.inject({method: 'PUT', url: 'supplies/' + '3786234892', payload: {
          name: "Edit",
          description: "Edit",
          type: "Edit",
          color: "Edit",
          quantity: 0
        }});
      expect(res.statusCode).to.equal(404);
    });

    it('should return 400 if missing body parameter', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'PUT', url: 'supplies/' + supply.id, payload: {
            name: "Edit",
            description: "Edit",
            color: "Edit",
            quantity: 0
          }});
        expect(res.statusCode).to.equal(400);
      } else {
        throw Error('No supply Id');
      }
    });

    it('should return 400 if quantity inferior to 0', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'PUT', url: 'supplies/' + supply.id, payload: {
            name: "Edit",
            description: "Edit",
            type: "Edit",
            color: "Edit",
            quantity: -1
          }});
        expect(res.statusCode).to.equal(400);
      } else {
        throw Error('No supply Id');
      }
    });

    it('should return 200 if correct body', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'PUT', url: 'supplies/' + supply.id, payload: {
            name: "Edit",
            description: "Edit",
            type: "Edit",
            color: "Edit",
            quantity: 10
          }});
        expect(res.statusCode).to.equal(200);
      } else {
        throw Error('No supply Id');
      }
    });

    it('should have successfully edited if correct body', async () => {
      if (supply.id) {
        await fastify.inject({method: 'PUT', url: 'supplies/' + supply.id, payload: {
            name: "Edit",
            description: "Edit",
            type: "Edit",
            color: "Edit",
            quantity: 10
          }});
        const resSupply: Supply = JSON.parse((await fastify.inject({method: 'GET', url: 'supplies/' + supply.id})).body) as Supply;
        expect(resSupply.description).to.equal('Edit');
        expect(resSupply.type).to.equal('Edit');
        expect(resSupply.color).to.equal('Edit');
        expect(resSupply.quantity).to.equal(10);
        expect(resSupply.name).to.equal('Edit');
      } else {
        throw Error('No supply Id');
      }
    });
  });

  describe('DELETE /supplies/:supplyId', () => {
    let supply: Supply;

    beforeEach(async () => {
      supply = JSON.parse((await fastify.inject({method: 'POST', url: 'supplies', payload : {
          name: "Test",
          description: "Test",
          type: "Test",
          color: "Test",
          quantity: 10
        }})).body) as Supply;
    });

    it('should return 404 if incorrect Id', async () => {
      const res = await fastify.inject({method: 'DELETE', url: 'supplies/' + '3786234892'});
      expect(res.statusCode).to.equal(404);
    });

    it('should return 200 if correct request', async () => {
      if (supply.id) {
        const res = await fastify.inject({method: 'DELETE', url: 'supplies/' + supply.id});
        expect(res.statusCode).to.equal(200);
      } else {
        throw Error('No supply Id');
      }
    });

    it('should have successfully deleted the supply', async () => {
      if (supply.id) {
        await fastify.inject({method: 'DELETE', url: 'supplies/' + supply.id});
        const res = await fastify.inject({method: 'GET', url: 'supplies/' + supply.id});

        expect(res.statusCode).to.equal(404);
      } else {
        throw Error('No supply Id');
      }
    });
  });

});
