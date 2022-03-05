import {Response} from "light-my-request";
import {fastify} from "../../lib/fastify";
import {projectCorrectBody} from "../helpers/body-helper";
import {expect} from "chai";
import * as admin from 'firebase-admin';
import {Project} from "../../schemas/types/project";
import {TodoItem} from "../../schemas/types/todo-item";

describe('POST /projects', () => {

  let postRes: Response;

  before(async () => {
    postRes = await fastify.inject({method: 'POST', url: '/projects', payload: projectCorrectBody});
  });

  it('should accept correctly formed body', async () => {
    expect(postRes.statusCode).to.equal(200);
  });

  it('should return correct value', () => {
    expect(postRes.body.length).to.be.above(0);
  });

  it('should have created an item in the project collection', async () => {
    const doc = await admin.firestore().collection('project').doc(postRes.body).get();
    const project: Project = doc.data() as Project;
    expect(project.name).to.equal(projectCorrectBody.name);
    expect(project.description).to.equal(projectCorrectBody.description);
  });

  describe('todo list creation',  () => {

    const todo: TodoItem[] = [];

    before(async () => {
      const data = await admin.firestore().collection('project').doc(postRes.body).collection('todo').get();
      data.docs.map(doc => todo.push(doc.data() as TodoItem));
    });

    it('should have created the right amount of todo items',  () => {
      expect(todo.length).to.equal(projectCorrectBody?.todo?.length);
    });

    it('should have properly formatted todo items',  () => {
      todo.forEach(todoItem => {
        expect(projectCorrectBody?.todo?.includes(todoItem)).to.equal(false);
      });
    })
  });
});
