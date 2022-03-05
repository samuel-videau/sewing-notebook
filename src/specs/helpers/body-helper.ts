import {Project} from "../../schemas/types/project";

export const projectCorrectBody: Project = {
  name : 'Project name',
  description: 'Project description',
  todo: [{
    name: 'ToDo1',
    description: 'First to-do item',
    completed: false,
    suppliesRequired: [{
      supplyId: '3224',
      quantity: 1
    }]
  }]
};
